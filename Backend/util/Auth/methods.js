const passport = require('passport');
require('./passport.js')(passport);
const jwt = require('jsonwebtoken');

// Authentication server private key for token generation (tokens to be verified by passport service using paired public key)
const fs = require('fs');
const PRIVATE_KEY = fs.readFileSync('./rsa_private.pem', 'utf8');
const crypto = require('crypto');

// Create users, encrypt stored passwords
function createUser(username, password) {
    let salt = crypto.randomBytes(32).toString('hex');
    let hashedPassword = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    authenticationMap.set(username, { hashedPassword: hashedPassword, salt: salt });
}


// Catch invalid JSON format
app.use(express.json());
app.use((err, req, res, next) => {
    res.status(400).json({ status: 400, message: "Invalid JSON format" })
});


app.post('/login', (req, res) => {
    const username = req.body.username;
    const hashedPassword = crypto.pbkdf2Sync(req.body.password, authenticationMap.get(username).salt, 10000, 64, 'sha512').toString('hex');
    if (hashedPassword !== authenticationMap.get(username).hashedPassword) return res.status(401).json({ status: 401, message: "Login Failure: Invalid credentials" });

    // Token expires in 90 seconds
    const expiresIn = '90000';

    const payload = {
        sub: { username, access: authenticationMap.get(username).access }
    };

    const token = jwt.sign(payload, PRIVATE_KEY, { expiresIn: expiresIn, algorithm: 'RS256' });
    res.status(200).json({ status: 200, username: username, token: token, expiresIn: expiresIn });
});

app.use(passport.initialize());

// Authenticates supplied token and provides custom error messages
function authenticateToken(req, res, next) {
    passport.authenticate('jwt', { session: false }, (error, user, info) => {
        if (user == false) {
            if (info.name === "TokenExpiredError") return res.status(400).json({ status: 400, message: "Authentication Failure: Expired token" });
            if (info.name === "JsonWebTokenError") return res.status(400).json({ status: 400, message: "Authentication Failure: Invalid token" });
            if (info.name === "Error") return res.status(400).json({ status: 400, message: "Authentication Failure: Missing token" });
            return res.status(400).json({ status: 400, message: "Authentication Failure: General" });
        } 
        req.user = user;
        next();
    })(req, res);
}

// Routes with middleware authentication
app.post("/add", authenticateToken, (req, res) => { authorizeAction(req, res, addition); })
app.post("/multiply", authenticateToken, (req, res) => { authorizeAction(req, res, multiplication); })
app.post("/subtract", authenticateToken, (req, res) => { authorizeAction(req, res, subtraction); });
app.post("/divide", authenticateToken, (req, res) => { authorizeAction(req, res, division); })

app.use((req, res) => {
    res.sendStatus(404);
});
