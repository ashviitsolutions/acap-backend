const mongoose = require('mongoose')

const packageSchema = new mongoose.Schema({

    packageName: {
        type: String,
        required: true
    },

    pricing: {
        type: Object,
        required: true,
        validate: {
            validator: function (pricing) {
                for (const key in pricing) {
                    if (isNaN(parseInt(key)) || typeof pricing[key] !== 'number') {
                        return false;
                    }
                }
                return true;
            },
            message: 'Invalid pricing object'
        }
    }
},
    {timestamps:true}
)

module.exports = mongoose.model('packageSchema', packageSchema)