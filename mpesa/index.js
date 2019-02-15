var moment = require('moment');

let ApiHelpers = require('./ApiHelpers')

/*
// confirmation url
app.all("/confirmation",(req,res)=>{
    console.log("confirmed")
})

// validation url
app.all("/validation",(req,res)=>{
    console.log("validated")
})

// timeout url
app.all("/timeout",(req,res)=>{
    console.log("timeout")
})

// result url
app.all("/result",(req,res)=>{
    console.log("result :",res)
    // res.json()
})
*/

exports.handleMpesa = (data) => {
    
    
    ApiHelpers.genOAuth().then(body => {  
        // console.log("inside lipaNaMpesa handler:",data)  
        let _body = JSON.parse(body);
        let oauth_token = _body.access_token;
        let auth = "Bearer " + oauth_token;

        console.log("auth:",auth)
        /*
        ApiHelpers.registerURL(auth).then(body => {
            console.log(body)
        })
        */
        /*
        ApiHelpers.simulateC2B(auth).then(body => {
            console.log(body)
        })
        */
        /*
        ApiHelpers.accountBalance(auth).then(body => {
            console.log(body)
        }).catch(error => {
            console.log("Error :",error)
        })
        */
        
        /*
        ApiHelpers.transactionStatus(auth).then(body => {
            console.log(body)
        })
        */
        
        ApiHelpers.lipaNaMpesa(auth).then(body => {
            
            console.log("Body :",body)
        }).catch(error => {
            console.log("Error :",error)
        })
        
        
        /*
        ApiHelpers.lipaNaMpesaQuery(auth).then(body => {
            console.log("Body :",body)
        }).catch(error => {
            console.log("Error :",error)
        })   
        */
    })

}

