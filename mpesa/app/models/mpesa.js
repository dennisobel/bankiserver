const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.Promise = global.Promise;

const mpesaSchema = new Schema({
    result:{
        type: String
    }
})

module.exports = mongoose.model("MpesaSchema", mpesaSchema);