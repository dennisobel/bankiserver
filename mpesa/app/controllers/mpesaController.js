const db = require("./../models");
const mpesaController = {};

mpesaController.post = (req,res,next) => {
    console.log("inside controller")
}

module.exports = {
    mpesaController
}
