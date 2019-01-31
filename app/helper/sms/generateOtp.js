var exports = module.exports = {}

exports.generateOTP = function(){
    return Math.floor(Math.random() * 10000) + 9999
}