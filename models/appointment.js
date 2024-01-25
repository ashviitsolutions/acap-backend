const mongoose = require('mongoose')

const appointment = new mongoose.Schema({
    name:String,
    email:String,
    yearsOfExperience:Number,
    phone:Number,
    date:String,
    time:String,
    scheduled:{
        type:Boolean,
        default:false
    }
}, {timestamps:true})

module.exports = mongoose.model('appointment', appointment)