const User = require('../models/user-model'); //user model
const mysql = require('mysql2'); //used for mysql calls
const config = require('../config/config.json'); //used to get db details
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

//create mysql pool to connect to MySQL db
const db = mysql.createPool({
    connectionLimit: config.connectionLimit,
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database
});

//create new user
exports.createUser = async (req, res, next) => {
    try {
        console.log("creating user...");
        //use the following items to create a new user
        const username = req.body.username;

        bcrypt.genSalt(10).then(salt => {
            bcrypt.hash(req.body.password, salt).then(hash => {
                console.log(`username: ${req.body.username} , password: ${req.body.password}`)
                console.log(`salt: ${salt} , hash: ${hash}`);

                //should add checks for valid email/mobile formats
                const email = req.body.email;
                const mobile = req.body.mobile;
                const postcode = req.body.postcode;
                const searchradius = 100; //default search radius (km)
                const regdate = req.body.regdate; // this could be local variable (get server time)

                //establish connection to db
                db.getConnection((err, connection) => {
                    if (err) throw (err)

                    //sql search query
                    const sqlSearch = "SELECT USER_ID FROM USER_ENCRYPT WHERE USER_NAME = ?"
                    const search_query = mysql.format(sqlSearch, [username])

                    //sql insert query
                    const sqlInsert = "INSERT INTO USER_ENCRYPT (USER_NAME, USER_PWD_HASH, USER_EMAIL, USER_MOBILE, USER_POSTCODE, USER_SEARCH_RDS) VALUES (?,?,?,?,?,?)";
                    const insert_query = mysql.format(sqlInsert, [username, hash, email, mobile, postcode, searchradius]);
                    //start search query
                    connection.query(search_query, (err, result) => {
                        if (err) throw (err)
                        console.log("-> Search Results")
                        console.log(result.length)
                        if (result.length != 0) {
                            connection.release()
                            console.log("-> User already exists")
                            res.status(404).send("User already exists");
                        }
                        else {
                            //if the user doesn't exist, insert new user
                            connection.query(insert_query, (err, result) => {
                                connection.release()
                                if (err) throw (err)
                                console.log("--> Created new User")
                                console.log(result.insertId)
                                res.status(200).send("User created successfully");
                            })
                        }
                    })
                })
            });
        });
    } catch (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      }
}

exports.searchUser = async (req, res, next) => {
    try {
        //try and get item by name, could have multiple responses.
        const [userData] = await User.searchUser(req.body.username);
        res.status(200).json(userData);
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

//log in
exports.Login = async (req, res, next) => {
try {
    //user details
    const username = req.body.username;

     //start db connection
     db.getConnection ( async (err, connection)=> 
     {
         const search_query = mysql.format("Select USER_ID,USER_NAME,USER_MOBILE,USER_EMAIL,USER_PWD_HASH from USER_ENCRYPT where USER_NAME = ?", [username])

         //query db
         connection.query (search_query, async (err, result) => 
         {
             connection.release()

             if (result.length == 0) 
             {
                 console.log("-> Username/Password Incorrect")
                 res.status(404).send("Username/Password Incorrect!");
             } 
             else 
             {
                 bcrypt.compare(req.body.password, result[0].USER_PWD_HASH).then(match => {
                     if (match) {
                         // Create a token that expires in 24 hours
                         const expiresIn = '24h';
                         const payload = { sub: result[0].USER_ID };

                         const token = jwt.sign(payload, process.env.PRIVATE_KEY, { expiresIn: expiresIn, algorithm: 'RS256' });

                         console.log("Generated JWT: " + token + " for user: " + username);

                         res.status(200).json({ status: 200, token: token, phone: result[0].USER_MOBILE, email: result[0].USER_EMAIL });
                     } else {
                         return res.status(401).json({ status: 401, message: "Login Failure: Invalid credentials" });
                     }
                 }).catch(err => console.error("error = ", err.message));
             }
         })
     })
} catch (err) {
    console.log("error:", err);
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
    }
}

//reset password
exports.ResetPassword = async (req, res, next) => {
    try {
        //user details
        username = req.body.username;

        //start db connection
        db.getConnection ( async (err, connection)=> 
        {
            if (err) throw (err)
            //sql search query
            const sqlSearch = "Select USER_ID,USER_PWD_HASH,USER_PWD_SALT from USER_ENCRYPT where USER_NAME = ?"
            const search_query = mysql.format(sqlSearch, [username])

            //query db
            connection.query (search_query, async (err, result) => 
            {
                connection.release()
                
                if (err) throw (err)
                //if no results
                if (result.length == 0) 
                {
                    console.log("-> Username/Password Incorrect")
                    res.status(404).send("Username/Password Incorrect!");
                } 
                else 
                {
                    //if there is a result

                    bcrypt.compare(req.body.password, result[0].USER_PWD_HASH).then(match => {
                        if (match) {
                            bcrypt.genSalt(10).then(salt => {
                                bcrypt.hash(req.body.newpassword, salt).then(hash => {
                                    connection.query('UPDATE USER_ENCRYPT SET USER_PWD_HASH = ? WHERE USER_ID = ?', [hash, result[0].USER_ID], async (err, result) => {
                                        connection.release()
                                        if (err) throw (err)
                                        if (result.length == 0) {
                                            console.log("-> Error resetting password")
                                            res.status(404).send("Error resetting password");
                                        }
                                        else {
                                            res.status(200).send("Password reset seccessfully");
                                        }
                                    })
                                });
                            });
                        } else {
                            return res.status(401).json({ status: 401, message: "Reset Failure: Invalid credentials" });
                        }
                    }).catch(err => console.error("error = ", err.message));
                }
            })
        })
    } catch (err) {
        console.log("error:", err);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
        }
}