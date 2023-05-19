const User = require('../models/user-model'); //user model
const bcrypt = require('bcrypt'); // this package is used for hashing.
const mysql = require('mysql2'); //used for mysql calls
const config = require('../config/config.json'); //used to get db details
const generateAccessTokens = require("../util/generateAccessToken"); //used for login token

require("dotenv").config();
const nodemailer = require('nodemailer');

const express = require('express');
const VerificationSchema = require('../models/authentication');
const client = require('twilio')(process.env.ACC_SID, process.env.AUTH_TOKEN);

//create mysql pool to connect to MySQL db
const db = mysql.createPool({
    connectionLimit: config.connectionLimit,
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database
});

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth:
    {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    }
})

//create new user
exports.createUser = async (req, res, next) => {
    try {
        console.log("creating user...");
        //use the following items to create a new user
        username = req.body.username;
        //password = await bcrypt.hash(req.body.password,10); //use bcrypt to encrypt the passwords, can add password salting later for more secure login
        password = req.body.password;
        email = req.body.email;
        mobile = req.body.mobile;
        postcode = req.body.postcode;
        //const permission = 0; //admin is 1, user is 0
        const searchradius = 100; //default search radius (km)
        //const active = 1; //user is active (1)
        regdate = req.body.regdate;

        //establish connection to db
        db.getConnection((err, connection) => 
        {
            if (err) throw (err)

            //sql search query
            const sqlSearch = "SELECT * FROM USER WHERE USER_NAME = ?"
            const search_query = mysql.format(sqlSearch,[username])

            //sql insert query
            const sqlInsert = "INSERT INTO USER (USER_NAME, USER_PWD, USER_EMAIL, USER_MOBILE, USER_POSTCODE, USER_SEARCH_RDS, USER_REG_DTTM) VALUES (?,?,?,?,?,?,?)"
            const insert_query = mysql.format(sqlInsert,[username, password, email, mobile, permission, postcode, searchradius, regdate])
            //start search query
            connection.query (search_query, (err, result) => 
            {
                if (err) throw (err)
                console.log("-> Search Results")
                console.log(result.length)
                if (result.length != 0) 
                {
                    connection.release()
                    console.log("-> User already exists")
                    res.status(404).send("User already exists");
                } 
                else 
                {
                    //if the user doesn't exist, insert new user
                    connection.query (insert_query, (err, result)=> 
                    {
                        connection.release()
                        if (err) throw (err)
                        console.log ("--> Created new User")
                        console.log(result.insertId)
                        res.status(200).send("User created successfully");
                    })
                }
            })
        })
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
        username = req.body.username;
        password = req.body.password;
         //start db connection
         db.getConnection ( async (err, connection)=> 
         {
             const search_query = mysql.format("Select * from USER where USER_NAME = ?", [username])
    
             //query db
             connection.query (search_query, async (err, result) => 
             {
                 connection.release()
                 
                 
                 //if (err) throw (err)
                 //if no results
                 if (result.length == 0) 
                 {
                     console.log("-> Username/Password Incorrect")
                     res.status(404).send("Username/Password Incorrect!");
                 } 
                 else 
                 {
                     //if there is a result
                     //const hashedPassword = result[0].password
                     const hashedPassword = await bcrypt.hash(req.body.password, 10);
                     //get the hashedPassword from result
                     if (await bcrypt.compare(password, hashedPassword)) 
                     {
                         //generate access token
                         console.log("--> Login Successful");
                         console.log("--> Generating accessToken");
                         //console.log(result[0].id);
    
                         //process.env.USERID = result[0].USER_ID;
                         //process.env.USER = result[0].USER_NAME;
                         console.log("--> Generating OTP");
                         const otp = Math.floor(1000 + Math.random() * 9000)
                        
                        //Send the email to the user
                         const mailOption = {
                             from: process.env.AUTH_EMAIL,
                             to: result[0].USER_EMAIL,
                             subject: "HERE'S YOUR ONE TIME PASSWORD",
                             text: "Your one time password is " + otp.toString(),
                         }
                         await transporter.sendMail(mailOption);

                         console.log("--> OTP Sent to Email, Awaiting verification");   
                         //res.status(200).send("OTP sent successfully");
                         
                         //This is a version that sends OTP via SMS using Twilio
                        //  client.messages.create(
                        //     {
                        //         body: "HERE'S YOUR ONE TIME PASSWORD " + otp.toString(),
                        //         to: result[0].USER_MOBILE, 
                        //         from: "+61333333333" //THIS HAS TO BE A PHONE NUMBER CREATED BY TWILIO
                        //     }
                        //  ).then(messages => console.log("--> OTP Sent, Awaiting verification"))
                        //console.log("--> OTP Sent to SMS, Awaiting verification");   
                        //res.status(200).send("OTP sent successfully");
                        
                         //Delete all this after frontend are ready
                          const accessToken =  generateAccessTokens({username: username})
                          console.log({accessToken: accessToken})
                          //used for /routes/receipt.js
                          const data = {
                              token: accessToken.toString(),
                              user_id: result[0].USER_ID,
                              phone: result[0].USER_MOBILE,
                              email: result[0].USER_EMAIL
                          }
                          res.status(200).send(data);
                         //Until here, keeping it to remain login functionality
                      } 
                     else 
                     {
                         console.log("-> Username/Password Incorrect")
                         res.status(403).send("Username/Password Incorrect!");
                     }
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



exports.verify = async (req, res, next) => {
    try {

        const otpHolder = await VerificationSchema.find({
            OTP : req.body.OTP
        })

        //query db
        connection.query (async (err, result) => 
        {
            connection.release()
            
            
            //if (err) throw (err)
            //if no results
            if (result.length == 0) 
            {
                console.log("-> OTP Incorrect")
                res.status(404).send("OTP Incorrect!");
            } 
            else 
            {
                const hashedOTP = await bcrypt.hash(VerificationSchema[0].otpHolder, 10);
                //get the hashedPassword from result
                if (await bcrypt.compare(otpHolder, hashedOTP)) 
                {
                    //generate access token
                    console.log("--> Login Successful");
                    console.log("--> Generating accessToken");

                    const accessToken =  generateAccessTokens({username: username})
                    console.log({accessToken: accessToken})
                    //used for /routes/receipt.js
                    const data = {
                        token: accessToken.toString(),
                        user_id: result[0].USER_ID,
                        phone: result[0].USER_MOBILE,
                        email: result[0].USER_EMAIL
                    }
                    res.status(200).send(data);
                } 
                else 
                {
                    console.log("-> OTP Incorrect")
                    res.status(403).send("OTP Incorrect!");
                }
            }
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
        password = await bcrypt.hash(req.body.password, 10);
        newpassword = await bcrypt.hash(req.body.newpassword,10);
        //start db connection
        db.getConnection ( async (err, connection)=> 
        {
            if (err) throw (err)
            //sql search query
            const sqlSearch = "Select * from USER where USER_NAME = ?"
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
                    const hashedPassword = result[0].password

                    //get the hashedPassword from result
                    if (await bcrypt.compare(password, hashedPassword)) 
                    {
                        //generate access token
                        console.log("--> Password reset")
                        //return db.execute('UPDATE users SET password = ? WHERE username = ?', [newpassword, username]);
                        connection.query ('UPDATE USER SET USER_PWD = ? WHERE USER_NAME = ?', [newpassword, username], async (err, result) => 
                        {
                            connection.release()
                            
                            if (err) throw (err)
                            //if no results
                            if (result.length == 0) 
                            {
                                console.log("-> Error resetting password")
                                res.status(404).send("Error resetting password");
                            } 
                            else 
                            {
                                res.status(200).send("Password reset seccessfully");
                            }
                        })
                    
                    } 
                    else 
                    {
                        console.log("-> Username/Password Incorrect")
                        res.status(403).send("Username/Password Incorrect!");
                    }
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
