// let helper = require('./../Helpers')
// let mpesa = require('../mpesa')
var moment = require('moment');
let ApiHelpers = require('../../mpesa/ApiHelpers')

const mpesaController = {}

mpesaController.post = (req,res) => {
    console.log('MPESA REQ.BODY: ',req.body)

    ApiHelpers.genOAuth().then(body => {  
        console.log("inside genOauth")
        let _body = JSON.parse(body);
        let oauth_token = _body.access_token;
        let auth = "Bearer " + oauth_token;

        console.log("auth:",auth)

        ApiHelpers.lipaNaMpesa(auth).then(body => { 
            console.log("inside lipanampesa")           
            console.log("Body :",body)
        }).catch(error => {
            console.log("Error :",error)
        })                
    }) 
}

module.exports = {
    mpesaController
}