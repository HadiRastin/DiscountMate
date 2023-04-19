//use express
const express = require('express');
const router = express.Router();

//controller
const userController = require('../controllers/user');

//create user
router.post('/create', userController.createUser);

//login
router.post('/login', userController.Login);

//reset password
router.put('/reset', userController.ResetPassword);

//search filter request
router.post('/search', userController.searchUser);

router.post('/login/verify', userController.verifyUser);

//export router
module.exports = router;
