let request = require('request');
var rp = require('request-promise');
let moment = require('moment');
let base64 = require('base-64'); 

let consumer_key = "RwV9nAayEJB4KOqz6Jhwpb3KchTp1QYm"; 
let consumer_secret = "idQR39pxoUVfd2B2";
let SecurityCredential = "fP6K2KuL"
let genoauthUrl = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
let c2bsimulateUrl = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/simulate";
let registerUrl = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl";
let accountbalUrl = "https://sandbox.safaricom.co.ke/mpesa/accountbalance/v1/query";
let transactionStatusUrl = "https://sandbox.safaricom.co.ke/mpesa/transactionstatus/v1/query";
let reversalUrl = "https://sandbox.safaricom.co.ke/mpesa/reversal/v1/request";
let lipaNaMpesaUrl = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
let lipaNaMpesaQueryUrl = "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query";
let QueueTimeOutURL = "https://197.248.117.74:3000/timeout";
let ResultURL = "https://197.248.117.74:3000/result";
let ConfirmationURL = "https://197.248.117.74:3000/confirmation";
let ValidationURL = "https://197.248.117.74:3000/validation";
let CallBackURL = "https://197.248.117.74:3000/callback";

let onlinePassKey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
let onlineShortCode = "174379";
let ResponseType = "Completed";
let ShortCode = "600733";
let Initiator = "Safaricomapi";
let auth = "Basic " +  Buffer.from(consumer_key + ":" + consumer_secret).toString("base64");
let TimeStamp = moment(new Date(Date.now())).format("YYYYMMDDHHmmss")

// OAuth access token and expiry
exports.genOAuth = () => {
    return rp(
        {
            url:genoauthUrl,
            headers:{
                "Authorization":auth
            }
        },
        (error,response,body) => {
            // console.log("GEN OAUTH:", body)
            return body;
        }
    )
}

// Register C2B URL
exports.registerURL = (auth) => {
    return rp(
        {
            method:"POST",
            url:registerUrl,
            headers:{
                "Authorization":auth
            },
            json:{
                "ShortCode": ShortCode,
                "ResponseType": ResponseType,
                "ConfirmationURL": ConfirmationURL,
                "ValidationURL": ValidationURL
            }
        },
        (error,response,body) => {
            return body;
        }
    )
}

// Simulate C2B 
exports.simulateC2B = (auth) => {
    return rp(
        {
            method:"POST",
            url:c2bsimulateUrl,
            headers:{
                "Authorization":auth
            },
            json:{
                "ShortCode":ShortCode,
                "CommandID":"CustomerPayBillOnline",
                "Amount":"10",
                "Msisdn":"254727677068",
                "BillRefNumber":"12"    
            }
        },
        (error,response,body) => {
            return body;
        }
    )
}

// Check balance
exports.accountBalance = (auth) => {
    return rp(
        {
            method:"POST",
            url:accountbalUrl,
            headers:{
                "Authorization":auth
            },
            json : {
                "Initiator":Initiator,
                "SecurityCredential":SecurityCredential,
                "CommandID":"AccountBalance",
                "PartyA":"600733",
                "IdentifierType":"4",
                "Remarks":"check balance test",
                "QueueTimeOutURL":QueueTimeOutURL,
                "ResultURL":ResultURL
            }
        },
        function(error,response,body){
            return body;
        }
    )
}

// Transaction Status
exports.transactionStatus = (auth) => {
    return rp(
        {
            method:"POST",
            url:transactionStatusUrl,
            headers:{
                "Authorization":auth
            },
            json:{
                "Initiator":Initiator,
                "SecurityCredential":SecurityCredential,
                "CommandID":"TransactionStatusQuery",
                "TransactionID":"KBSACCO",
                "PartyA":"600733",
                "IdentifierType":"1",
                "ResultURL":ResultURL,
                "QueueTimeOutURL":QueueTimeOutURL,
                "Remarks":"Transaction Status",
                "Occasion":"1234"
            }
        },
        function(error,response,body){
            return body;
        }
    )
}

// Transaction Reversal
exports.transactionReversal = (auth) => {
    return rp(
        {
            method:"POST",
            url:reversalUrl,
            headers:{
                "Authorization":auth
            },
            json:{
                "Initiator":Initiator,
                "SecurityCredential":SecurityCredential,
                "CommandID":"TransactionReversal",
                "TransactionID":"KBSACCO",
                "Amount":"10",
                "ReceiverParty":"600733",
                "RecieverIdentifierType":"4",
                "ResultURL":ResultURL,
                "QueueTimeOutURL":QueueTimeOutURL,
                "Remarks":"Transaction Reversal",
                "Occasion":"12"
            }
        },
        function(error,response,body){
            return body;
        }
    )
}
 
// Lipa na M-Pesa Online Payment
exports.lipaNaMpesa = (auth) => {
    console.log("inside lipa")
    return rp(
        {
            method:"POST",
            url:lipaNaMpesaUrl,
            headers:{
                "Authorization":auth
            },
            json:{
                "BusinessShortCode": onlineShortCode,
                "Password":  Buffer.from(onlineShortCode + onlinePassKey + TimeStamp).toString("base64"),
                "Timestamp": moment(new Date(Date.now())).format("YYYYMMDDHHmmss"),
                "TransactionType": "CustomerPayBillOnline",
                "Amount": "10",
                "PartyA": "254727677068",
                "PartyB": onlineShortCode,
                "PhoneNumber": "254727677068",
                "CallBackURL": CallBackURL,
                "AccountReference": "ABCD1234",
                "TransactionDesc": " better have my money"                    
            }
        },
        function(error,response,body){       
            // console.log(Buffer.from(onlineShortCode + onlinePassKey + TimeStamp).toString("base64"))  
            // console.log("base64 enceode :", base64.encode(onlineShortCode + onlinePassKey + TimeStamp))   
            return body
            // new Buffer(consumer_key + ":" + consumer_secret).toString("base64");
        }
    )
}

exports.lipaNaMpesaQuery = (auth) => {
    return rp(
        {
            method:"POST",
            url:lipaNaMpesaQueryUrl,
            headers:{
                "Authorization":auth
            },
            json:{
                "BusinessShortCode": onlineShortCode ,
                "Password":  Buffer.from(onlineShortCode + onlinePassKey + TimeStamp).toString("base64"),
                "Timestamp": TimeStamp,
                "CheckoutRequestID": "ws_CO_DMZ_73778311_07092018145736338"
            }
        },
        function(error,response,body){            
            return body
        }
    )
}