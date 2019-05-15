let express = require('express');
let passportService = require('../config/passport');
let passport = require('passport');
let {userController} = require('../controllers/userController');
let {verifyUserController} = require('../controllers/userController');
let {passCodeController} = require('../controllers/userController');
let {loginController} = require('../controllers/userController');
let {logoutController} = require('../controllers/userController');
let {balanceEnquiry} = require('../controllers/userController');
let {imageUpload} = require('../controllers/userController');

let {phoneNumberController} = require('../controllers/signupController');
let {otpVerifyController} = require('../controllers/signupController');
let {mnoController} = require('../controllers/signupController');
let {passwordController} = require('../controllers/signupController');
let {submitLoginController} = require('../controllers/signupController');
let {submitPINController} = require('../controllers/signupController');
let {mpesaController} = require('../controllers/mpesaController');

let {getUserController} = require('../controllers/userController')
let requireAuth = passport.authenticate('jwt', {session: false});
let requireLogin = passport.authenticate('local', {session: false});

let appRouter = (app)=>{
    app.post('/balanceenquiry',balanceEnquiry.post)
    app.post('/joinsacco',userController.post)
    app.post('/verifyuser',verifyUserController.post)
    app.post('/passcode',passCodeController.post)
    app.post('/login',loginController.post)

    app.post('/submitPhoneNumber', phoneNumberController.post)
    app.post('/submitOtp', otpVerifyController.post)
    app.post('/submitMno', mnoController.post)
    app.post('/submitPassword', passwordController.post)
    app.post('/submitLogin', submitLoginController.post)
    app.post('/submitPIN', submitPINController.post)
    // app.post('/imageupload', imageUpload.post)
    // app.post('/imageupload', imageUpload.post);
    app.post('/depositFromMpesa', mpesaController.post);

    
    
    app.get('/logout',logoutController.get)
    app.get('/getuser',getUserController.get)
    app.get('/protected', requireAuth, (req,res)=>{
        res.send({content:'Success'})
    });

    
}

module.exports = appRouter