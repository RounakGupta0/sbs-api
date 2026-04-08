const mongoose = require('mongoose')

const contactSchema = new mongoose.Schema({
    fullName:{type:String,required:true},
    phone:{type:String,required:true},
    email:{type:String,required:true},
    address:{type:String,required:true},
    gender:{type:String,required:true}
})

module.exports = mongoose.model('contact',contactSchema)