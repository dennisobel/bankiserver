var passport = require('passport');
var User = require('../models/user');
var config = require('./auth');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var LocalStrategy = require('passport-local').Strategy;

 
var localOptions = {
    usernameField: 'phone_number'
};

//local strategy 
var localLogin = new LocalStrategy(localOptions, function(password,phone_number,idnumber,done){
 
    User.findOne({
        idnumber: idnumber
    }, function(err, user){
 
        if(err){
            return done(err);
        }
 
        if(!user){
            return done(null, false, {error: 'Login failed. Please try again.'});
        }
 
        user.comparePassword(password, function(err, isMatch){
 
            if(err){
                return done(err);
            }
 
            if(!isMatch){
                return done(null, false, {error: 'Login failed. Please try again.'});
            }
 
            return done(null, user);
 
        });
 
    });
 
});
 
var jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.secret
};
 
var jwtLogin = new JwtStrategy(jwtOptions, function(payload, done){
 
    User.findById(payload.idnumber, function(err, user){
 
        if(err){
            return done(err, false);
        }
 
        if(user){
            done(null, user);
        } else {
            done(null, false);
        }
 
    });
 
});
 
passport.use(jwtLogin);
passport.use(localLogin);