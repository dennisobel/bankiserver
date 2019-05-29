const db = require("./../models");
const otpSecret = require("./../config/otp")
const otplib = require('otplib');
let helper = require('./../../Helpers')
let request = require("request");
let bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken'); 

const userController = {};
const getUserController = {};
const singleUserController = {};
const verifyUserController = {};
const passCodeController = {};
const loginController = {};
const logoutController = {};
const uploadImage = {};

const balanceEnquiry = {};
var authConfig = require('../config/auth');

generateToken = (user) =>{
    return jwt.sign(user, authConfig.secret, {
        expiresIn: 10080
    });
}

setUserInfo = (request) => {
    console.log("request",request)
    return {
        passcode:request.passcode,
        idnumber:request.idnumber,
        phonenumber:request.phonenumber
    }
}
 
userController.post = (req,res,next) => {
    // console.log("here come session:",req.session)
    const {
        idnumber,
        membernumber,
        phonenumber
    } = req.body;    

    const user = 'KBSACCO'
    const password = 'KBSACCO1';   
    const clientsmsid = 'YOURREFERENCENUMBER';
    const senderid='KBSACCO';
    const unicode=0;
    const mobiles = req.body.phonenumber; 

    if(!idnumber){
        return res.status(422).send({error: 'You must enter an id number'});
    }
 
    if(!phonenumber){
        return res.status(422).send({error: 'You must enter a phone number'});
    }

    // check if user exists
    db.UserSchema.findOne({
        idnumber:req.body.idnumber
    },(err,docs)=>{
        if(docs){
            console.log("user exists")
            let sms = `Hi, a member with that I.D already exists. Please click on 'Reactivate Account'.`; 
            let URL = `http://messaging.openocean.co.ke/sendsms.jsp?user=${user}&password=${password}&mobiles=${mobiles}&sms=${sms}&clientsmsid=${clientsmsid}&senderid=${senderid}`
            helper.sendMessage(URL)
        }else{
            console.log("user dont exist")
            // Create OTP
            let smsToken = otplib.authenticator.generate(otpSecret.secret)   
            // console.log(smsToken)   
            
            // Save OTP to db
            const newUser = new db.UserSchema({
                idnumber,
                membernumber,
                phonenumber,
                otp:smsToken
            },()=>console.log("new_user: ",newUser))
            .save()
            .then(()=>{
                
                let userInfo = setUserInfo(newUser);
                res.status(200).json({
                    success: true,
                    token: 'JWT ' + generateToken(userInfo),
                    user: userInfo
                })
            })
            .then(()=>{
                // Send OTP to number
                console.log(smsToken)
                let sms = `Hi, thank you for joining KBSACCO, your One Time Password is ${smsToken}`; 
                let URL = `http://messaging.openocean.co.ke/sendsms.jsp?user=${user}&password=${password}&mobiles=${mobiles}&sms=${sms}&clientsmsid=${clientsmsid}&senderid=${senderid}`
                helper.sendMessage(URL)  
            })
            .catch((err)=>{
                res.status(500).json({
                    message: err
                })
            }) 
        }
    })
}

getUserController.get = (req,res) => {
    console.log(req.body)
    db.UserSchema
        .find({membernumber:43307})
        .then((users)=>{
            return res.status(200).json({
                success: true,
                data: users
            })
        })
        .catch((err)=>{
            return res.status(500).json({
                message: err
            })
        })
}

singleUserController.get = (req,res) => {
    db.UserSchema.findOne({
        _id:req.params.id
    })
    .then((user) => {
        return res.status(200).json({
            success:true,
            user:user
        })
    })
    .catch((err) => {
        return res.status(500).json({
            message:err
        })
    })
}

verifyUserController.post = (req,res) => {
    // update user //mark as verified
    db.UserSchema
        .findOneAndUpdate({
            otp:req.body.otp
        },{verified:true})
        .then(()=>{
            // make sure update worked
            db.UserSchema
            .findOne({otp:req.body.otp}).then((result)=>{
                // console.log(result)
            })
        })
    //TODO: Create account on T24
}

passCodeController.post = (req,res) => {
    console.log(req.body.passcode)

    // hash password with bcrypt
    // gensalt    
    const saltRounds = 10;
    
    bcrypt.genSalt(saltRounds)
        .then(salt => {
            return bcrypt.hash(req.body.passcode,salt)
        })
        .then(hash => {
            console.log(`Hash: ${hash}`)
            // Store hash in your password DB.
            db.UserSchema
                .findOneAndUpdate({
                    idnumber:req.body.idnumber
                },{
                    passcode:hash
                })
                .then(()=>{
                    db.UserSchema
                        .findOne({
                            idnumber:req.body.idnumber
                        })
                        .then((result)=>{
                            console.log(result)
                        })
                })
        })
        
        /*
        bcrypt.hash(req.body.passcode,10,(err,hash)=>{
            if(err){
                throw Error;
            }
        })*/


        
       db.UserSchema
       .findOneAndUpdate({
           idnumber:req.body.idnumber
       },{
           passcode:req.body.passcode
       })
       .then(()=>{
           db.UserSchema
               .findOne({
                   idnumber:req.body.idnumber
               })
               .then((result)=>{
                   console.log(result)
               })
       })

}

loginController.post = (req,res) => {
    console.log("Inside Login Controller, Login Attempt",req.body)   
    let sess = req.session;
    sess.phonenumber = req.body.phonenumber
    
    db.UserSchema.findOne({
        membernumber:req.body.membernumber
    },(err,docs)=>{
        return docs
    }).then((docs)=>{
        if(docs){
            console.log("here come docs: ",docs)
            bcrypt.compare(req.body.passcode,docs.passcode,(err,response)=>{
                console.log("inside bcrypt:",req.body)
                console.log("inside bcrypt, response",response)
                if(response){
                    console.log("server login response:",response)
                    
                    return res.status(200).json({
                        success: true,
                        data: docs
                    })  
                    
                }else if(err){
                    throw new Error;
                } 
            })         
        }
    })
}

logoutController.get = (req,res) => {
    req.session.destroy((err)=>{
        if(err){
            console.log(err);
        }else{
            return res.status(200).json({
                success: true
            })              
        }
    })
}

uploadImage.post = (req,res) => {
    db.UserSchema
    .findOneAndUpdate({
        membernumber:req.body.membernumber
    },{
        image:req.body.image
    })
    .then(()=>{
        db.UserSchema
            .findOne({
                membernumber:req.body.membernumber
            })
            .then((result)=>{
                console.log(result)
            })
    })
}

// T24 Requests

balanceEnquiry.post = (req,res) => {
    // console.log("balance enquiry data",req.body)
    let balanceEnqStr = `ENQUIRY.SELECT,,MBK/123455/KE0010001,KBS.MB.PROC,CUSTOMER.NO:EQ=${req.body.membernumber},TRANSACTION.CODE:EQ=BAL`
    helper.T24Request(balanceEnqStr)
}

// export default userController
module.exports = {
    userController,
    getUserController,
    singleUserController,
    verifyUserController,
    passCodeController,
    loginController,
    logoutController,
    balanceEnquiry,
    uploadImage
}
