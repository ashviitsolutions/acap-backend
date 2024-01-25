const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
    payment_id:String,

    transaction_id:{
        type:String,
        unique:true
    },

    amount:{
        type:Number
    },

    paid_by:{
        type:String,
    },

    email:{
        type:String
    },

    productInfo:{
        type:String
    },

    status:{
        type:String
    }
    
},
    {timestamps:true}
)


module.exports= mongoose.model('paymentSchema', paymentSchema)