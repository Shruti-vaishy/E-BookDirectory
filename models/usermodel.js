const mongoose = require('./database.js');

const userSchema = new mongoose.Schema({
    username:String,
    email:String,
    password:String,
    books:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"bookmodel"
        }
    ]
})
const user = mongoose.model("usermodel",userSchema);
module.exports = user;