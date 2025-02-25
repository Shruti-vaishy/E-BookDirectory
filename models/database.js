const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

mongoose.connect(process.env.mongodb)
.then(()=>console.log('Connected to the Database'))
.catch(err=>console.log(err));

module.exports = mongoose;