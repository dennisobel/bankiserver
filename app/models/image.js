const mongoose = require('mongoose');
const { Schema } = mongoose;
var bcrypt   = require('bcrypt-nodejs');

mongoose.Promise = global.Promise;

const imageSchema = new Schema({
    fileName: String,
    originalName: String,
    desc: String,
    created: {
        type: Date,
        default: Date.now()
    }
})
 
module.exports = mongoose.model("ImageSchema", imageSchema);