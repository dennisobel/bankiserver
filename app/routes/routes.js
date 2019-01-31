let express = require('express');
let passportService = require('../config/passport');
let passport = require('passport');
let {userController} = require('../controllers/userController');
let {verifyUserController} = require('../controllers/userController');
let {passCodeController} = require('../controllers/userController');
let {loginController} = require('../controllers/userController');
let {logoutController} = require('../controllers/userController');
let {balanceEnquiry} = require('../controllers/userController')
let requireAuth = passport.authenticate('jwt', {session: false});
let requireLogin = passport.authenticate('local', {session: false});

let appRouter = (app)=>{
    app.post('/balanceenquiry',balanceEnquiry.post)
    app.post('/joinsacco',userController.post)
    app.post('/verifyuser',verifyUserController.post)
    app.post('/passcode',passCodeController.post)
    app.post('/login',loginController.post)
    app.get('/logout',logoutController.get)
    app.post('/getuser',userController.get)
    app.get('/protected', requireAuth, (req,res)=>{
        res.send({content:'Success'})
    });
}

module.exports = appRouter