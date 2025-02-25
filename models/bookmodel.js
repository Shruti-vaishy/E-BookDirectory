const { Types } = require("mongoose");
const mongoose = require("./database.js");

const bookSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    publisheddate:Date,
    book:String,
    image:{
        type:String
    }
})
module.exports = mongoose.model("bookmodel",bookSchema);
