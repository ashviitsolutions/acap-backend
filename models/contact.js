const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    category: String,
    email: String,
    name: String,
    yearsOfExperience: Number,
    phone: String,
    message: String,
    filename: String,
}, {
    timestamps: true,
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
