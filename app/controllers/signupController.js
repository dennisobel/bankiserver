const fs = require('fs')
const db = require("./../models");
const otpSecret = require("./../config/otp");
const otplib = require('otplib');
let helper = require('./../../Helpers')
let request = require("request");
let bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken'); 

// SMS PARAMETRES
const user = 'KBSACCO'
const password = 'KBSACCO1';   
const clientsmsid = 'YOURREFERENCENUMBER';
const senderid='KBSACCO';
const unicode=0;
// EOF SMS PARAMS

// Pass Hash
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

// EOF Pass Hash

const phoneNumberController = {}
const otpVerifyController = {}
const mnoController = {}
const passwordController = {}
const submitLoginController = {}
const submitPINController = {}

/*
phoneNumberController.post = (req,res,next) => {
    // PREP DATA FOR DB
    const {
        idnumber,
        membernumber,
        phoneNumber
    } = req.body;      
    //  EOF PREP DATA FOR DB
    console.log('PHONENUMBER: ',req.body.phoneNumber)

    fs.readFile(__dirname + '/mbd.json',(err,data) => {
        
        if(err) throw err;
        
        let members = JSON.parse(data);

        let memberData = members.filter((member) => {
            return member['MB.CELL.NO..'] === parseInt(req.body.phoneNumber)
        })  
        console.log(memberData)
        console.log("MEMBER DATA: ",typeof(memberData[0]['MB.CUST.NO']))
        
        if(memberData.length >= 1) {
            return new Promise((resolve,reject) => {
                resolve(
                    res.status(200).json({
                        success: true,
                        memberData: memberData
                    }) 
                )
            }).then(()=>{
                db.UserSchema.findOne({
                    phonenumber:req.body.phoneNumber
                },(err,docs) => {
                    if(docs) {
                        console.log("DOCS: ", docs);
                        let sms = `Hi, a member with that I.D already exists. Please click on 'Reactivate Account'.`; 
                        let URL = `http://messaging.openocean.co.ke/sendsms.jsp?user=${user}&password=${password}&mobiles=${req.body.phoneNumber}&sms=${sms}&clientsmsid=${clientsmsid}&senderid=${senderid}`
                        helper.sendMessage(URL)  
                    } else {
                        console.log('User doesnt exist');
                        let smsToken = otplib.authenticator.generate(otpSecret.secret) 
                        let newMember = db.UserSchema({
                            phonenumber:req.body.phoneNumber,
                            membernumber:memberData[0]['MB.CUST.NO'],
                            otp:smsToken
                        },()=>console.log("new_user: ",newUser))
                        .save()
                        .then(()=>{
                            console.log("SMSTOKEN: ",smsToken)
                            let sms = `Hi, thank you for joining KBSACCO, your One Time Password is ${smsToken}`; 
                            let URL = `http://messaging.openocean.co.ke/sendsms.jsp?user=${user}&password=${password}&mobiles=${req.body.phoneNumber}&sms=${sms}&clientsmsid=${clientsmsid}&senderid=${senderid}`
                            helper.sendMessage(URL)                             
                        })
                    }
                })
            })

        } else {
            res.status(200).json({
                success: false,
                memberData: null
            })          
        }
    })
}
*/




phoneNumberController.post = (req,res,next) => {
    // PREP DATA FOR DB
    const {
        idnumber,
        membernumber,
        phoneNumber
    } = req.body;      
    //  EOF PREP DATA FOR DB
    console.log('PHONENUMBER: ',req.body.phoneNumber)

    fs.readFile(__dirname + '/mbd.json',(err,data) => {
        
        if(err) throw err;
        
        let members = JSON.parse(data);

        let memberData = members.filter((member) => {
            return member['MB.CELL.NO..'] === parseInt(req.body.phoneNumber)
        })  
        console.log(memberData)
        console.log("MEMBER DATA: ",memberData[0]['MB.CUST.NO'])
        
        if(memberData.length >= 1) {
            return new Promise((resolve,reject) => {



                db.UserSchema.findOne({
                    phonenumber:req.body.phoneNumber
                },(err,docs) => {
                    if(docs) {
                        console.log("DOCS: ", docs);
                        let sms = `Hi, a member with that I.D already exists. Please click on 'Reactivate Account'.`; 
                        let URL = `http://messaging.openocean.co.ke/sendsms.jsp?user=${user}&password=${password}&mobiles=${req.body.phoneNumber}&sms=${sms}&clientsmsid=${clientsmsid}&senderid=${senderid}`
                        
                        // helper.sendMessage(URL)  

                        resolve(
                            res.status(200).json({
                                success: true,
                                memberExist: true,
                                memberData: memberData,
                                docs:docs
                            }) 
                        )                        
                    } else {
                        console.log('User doesnt exist');
                        resolve(
                            res.status(200).json({
                                success: true,
                                memberExist: false,
                                memberData: memberData
                            }) 
                        )                           
                        let smsToken = otplib.authenticator.generate(otpSecret.secret) 
                        let newMember = db.UserSchema({
                            phonenumber:req.body.phoneNumber,
                            membernumber:memberData[0]['MB.CUST.NO'],
                            otp:smsToken
                        },()=>console.log("new_user: ",newUser))
                        .save()
                        .then(()=>{
                            console.log("SMSTOKEN: ",smsToken)
                            let sms = `Hi, thank you for joining KBSACCO, your One Time Password is ${smsToken}`; 
                            let URL = `http://messaging.openocean.co.ke/sendsms.jsp?user=${user}&password=${password}&mobiles=${req.body.phoneNumber}&sms=${sms}&clientsmsid=${clientsmsid}&senderid=${senderid}`
                            
                            helper.sendMessage(URL)                             
                        })
                    }
                })





            }).then(()=>{

            })

        } else {
            res.status(200).json({
                success: false,
                memberData: null
            })          
        }
    })
}





otpVerifyController.post = (req,res) => {
    console.log(req.body)
    db.UserSchema
    .findOneAndUpdate({
        otp:req.body.otp
    },{verified:true})
    .then(()=>{
        // make sure update worked
        db.UserSchema
        .findOne({otp:req.body.otp}).then((result)=>{
            console.log(result)

            res.status(200).json({
                success: true,
                verified: result.verified
            })              
        })
    }) 
    .catch((err)=>{
        res.status(500).json({
            message: err
        })
    })     
}

mnoController.post = (req,res) => {
    console.log(req.body)
    db.UserSchema
    .findOneAndUpdate({
        membernumber:req.body.mno
    },{verifyMno:true})
    .then(()=>{
        // make sure update worked
        db.UserSchema
        .findOne({membernumber:req.body.mno}).then((result)=>{
            console.log("RESULT: ",result)

            res.status(200).json({
                success: true,
                verified: result.verifyMno
            })              
        })
    }) 
    .catch((err)=>{
        res.status(500).json({
            message: err,
            worked: false
        })
    }) 
}

passwordController.post = (req,res) => {
    console.log("INSIDE PASS CONTROLLER:",req.body)

    const saltRounds = 10;
    
    bcrypt.genSalt(saltRounds)
    .then(salt => {
        return bcrypt.hash(req.body.password,salt)
    })
    .then(hash => {
        console.log(`Hash: ${hash}`)
        // Store hash in your password DB.
        db.UserSchema
            .findOneAndUpdate({
                membernumber:req.body.mno
            },{
                passcode:hash
            })
            .then(()=>{
                db.UserSchema
                    .findOne({
                        membernumber:req.body.mno
                    })
                    .then((result)=>{
                        console.log(result)
                    })
            })
            .then(() => {
                res.status(200).json({
                    success: true
                })  
            })
            .catch((err)=>{
                res.status(500).json({
                    message: err
                })
            }) 
    })
}

submitLoginController.post = (req,res) => {
    console.log('LOGIN CTRLR: ', req.body)

    let sess = req.session;
    sess.phonenumber = req.body.phoneNumber
    
    db.UserSchema.findOne({
        membernumber:req.body.mno
    },(err,docs)=>{
        return docs
    }).then((docs)=>{
        if(docs){
            bcrypt.compare(req.body.password,docs.passcode,(err,response)=>{
                if(response){                    
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

submitPINController.post = (req,res) => {
    console.log('PIN DATA: ', req.body);

    db.UserSchema.findOne({
        membernumber:req.body.mno
    },(err,docs)=>{
        console.log("pin docs", docs)
        return docs
    }).then((docs)=>{
        if(docs){
            bcrypt.compare(req.body.password,docs.passcode,(err,response)=>{
                if(response){                    
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

module.exports = {
    phoneNumberController,
    otpVerifyController,
    mnoController,
    passwordController,
    submitLoginController,
    submitPINController
}

// success without fulfillment is the ultimate failure.