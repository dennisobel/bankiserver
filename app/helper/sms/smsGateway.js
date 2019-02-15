// We need this to build our post string
var querystring = require('querystring');
var https       = require('https');
var OTP = Math.floor(Math.random() * 10000) + 9999
// require('./generateOtp')


// Your login credentials
var username = 'digitalnative';
var apikey   = '9734d411d44457624c8eb6ec8ecfac522866b6d0e1da5cb32f359621e7cbc19a';
function sendMessage(phone) {
    console.log("OTP HERE:",OTP)
    // Define the recipient numbers in a comma separated string
    // Numbers should be in international format as shown
    var to      = phone;
    
    // And of course we want our recipients to know what we really do
    var message = `Here's your one time verification code: ${OTP}`;
    
    // Build the post string from an object
    
    var post_data = querystring.stringify({
        'username' : username,
        'to'       : to,
        'message'  : message
    });
    
    var post_options = {
        host   : 'api.africastalking.com',
        path   : '/version1/messaging',
        method : 'POST',
        
        rejectUnauthorized : false,
        requestCert        : true,
        agent              : false,
        
        headers: {
            'Content-Type' : 'application/x-www-form-urlencoded',
            'Content-Length': post_data.length,
            'Accept': 'application/json',
            'apikey': apikey
        }
    };
    
    var post_req = https.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            var jsObject   = JSON.parse(chunk);
            var recipients = jsObject.SMSMessageData.Recipients;
            if ( recipients.length > 0 ) {
                for (var i = 0; i < recipients.length; ++i ) {
                    var logStr  = 'number=' + recipients[i].number;
                    logStr     += ';cost='   + recipients[i].cost;
                    logStr     += ';status=' + recipients[i].status; // status is either "Success" or "error message"
                    logStr     += ';statusCode=' + recipients[i].statusCode;
                    console.log(logStr);
                    }
                } else {
                    console.log('Error while sending: ' + jsObject.SMSMessageData.Message);
            }
        });
    });
    
    // Add post parameters to the http request
    post_req.write(post_data);
    
    post_req.end();
}
//Call sendMessage method
module.exports = sendMessage