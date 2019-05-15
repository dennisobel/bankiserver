const mongoose = require('mongoose');
const { Schema } = mongoose;
var bcrypt   = require('bcrypt-nodejs');

mongoose.Promise = global.Promise;

const userSchema = new Schema({
    idnumber:{
        type: String
    },
    membernumber:{
        type: Number
    },    
    phonenumber:{
        type: String,
        unique: true
    },
    image:{
        type: String
    },
    otp:{
        type: String
    },
    passcode:{
        type:String
    },
    verified:{
        type:Boolean,
        default:false
    },
    verifyMno:{
        type:Boolean,
        default:false
    }     
})

/*
userSchema.pre('save',(next)=>{
    let user = this;
    let SALT_FACTOR = 5;

    if(!user.isModified('passcode')){
        return next();
    }

    bcrypt.genSalt(SALT_FACTOR, function(err, salt){
 
        if(err){
            return next(err);
        }
 
        bcrypt.hash(user.passcode, salt, null, function(err, hash){
 
            if(err){
                return next(err);
            }
 
            user.passcode = hash;
            next();
 
        });
 
    });

    UserSchema.methods.comparePassword = function(passwordAttempt, cb){
 
        bcrypt.compare(passwordAttempt, this.passcode, function(err, isMatch){
     
            if(err){
                return cb(err);
            } else {
                cb(null, isMatch);
            }
        });
     
    }
})
*/

// export default UserSchema;
module.exports = mongoose.model("UserSchema", userSchema);