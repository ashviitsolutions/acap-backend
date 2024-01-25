const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({

    paymentInfo:{
        type:mongoose.Types.ObjectId,
        ref:'paymentSchema'
    },

    userInfo:{
        type:mongoose.Types.ObjectId,
        ref:'User'
    },

    status:{
        type:Number
        //[0---->'New Request', 1------>'Delivered'] 
    },

    doc:{
        type:String
    }
}, {timestamps:true})

module.exports = mongoose.model('orders', orderSchema)