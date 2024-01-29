const { User, WorkExperience, Project, Education, Achievement, Award } = require('../models/userandFormDetails')
const orderSchema = require('../models/orders')
const appointmentSchema = require('../models/appointment')
const jwt = require('jsonwebtoken')
const { default: mongoose } = require('mongoose')
const { sendMail } = require('../utils/sendMail')
const fs = require('fs')
const Contact = require('../models/contact');
const path = require('path')


const adminRegisteration = async (req, res) => {
    const { name, email } = req.body

    try {
        if (name && email) {
            const admin = new User({
                personalDetails: {
                    name: name,
                    email: email
                }
            })

            admin.save().then(result => {
                return res.status(200).json({ msg: 'Added succesfully' })
            }).catch((err) => {
                return res.status(400).json(err.message)
            })
        } else {
            return res.status(400).json({ msg: "provide mandatory Fields" })
        }
    } catch (error) {
        return res.status(400).json(error.message)
    }
}

const login = async (req, res) => {
    const { name, email } = req.body

    User.findOne({ $and: [{ 'personalDetails.name': name }, { 'personalDetails.email': email }] }).then((resp) => {
        const token = jwt.sign({ _id: resp._id }, process.env.SECRET_KEY, { expiresIn: '3d' })
        console.log(token)
        res.setHeader("Access-Control-Expose-Headers", '*, authorization')
        res.setHeader('Authorization', 'Bearer ' + token)
        return res.status(200).json({ msg: "logged in successfully" })
    }).catch((err) => {
        return res.status(400).json(err.message)
    })
}

const updateOrderStatus = async (req, res) => {
    const orderid = req.params.id
    const status = req.body
    try {
        orderSchema.findOneAndUpdate({ _id: orderid }, {
            $set: {
                status: status
            }
        }, { new: true }).then((result) => {
            return res.status(200).json({ msg: "Status updated" })
        }).catch((err) => {
            return res.status(400).json(err.message)
        })
    } catch (error) {
        return res.status(400).json(error.message)
    }
}

const listOrders = async (req, res) => {

    try {
        const data = await orderSchema.find({}).sort({ createdAt: -1 }).populate('paymentInfo', 'productInfo amount').
            populate('userInfo', 'personalDetails.email personalDetails.name personalDetails.phone')

        if (data) {
            return res.status(200).json(data)
        } else {
            return res.status(400).json({ msg: "something went wrong" })
        }
    } catch (error) {
        return res.status(400).json(error.message)
    }
}

const getNewRequests = async (req, res) => {
    try {
        const data = await orderSchema.find({ status: 0 }).sort({ createdAt: -1 }).populate('paymentInfo', 'productInfo amount').
            populate('userInfo', 'personalDetails.email personalDetails.name personalDetails.phone')

        if (data) {
            return res.status(200).json(data)
        } else {
            return res.status(400).json({ msg: "something went wrong" })
        }
    } catch (error) {
        return res.status(400).json(error.message)
    }
}

const getDocsDelivered = async (req, res) => {
    try {
        const data = await orderSchema.find({ status: 1 }).populate('paymentInfo', 'productInfo amount').
            populate('userInfo', 'personalDetails.email personalDetails.name personalDetails.phone')

        if (data) {
            return res.status(200).json(data)
        } else {
            return res.status(400).json({ msg: "something went wrong" })
        }
    } catch (error) {
        return res.status(400).json(error.message)
    }
}


const fetchOrderDetails = async (req, res) => {
    const orderid = req.params.id

    try {
        const details = await orderSchema.findOne({ _id: orderid }).populate('paymentInfo', 'transaction_id')
            .populate('userInfo')

        if (details) {
            return res.status(200).json(details)
        } else {
            return res.status(400).json({ msg: "something went wrong" })
        }
    } catch (error) {
        return res.status(400).json(error.message)
    }
}


const getStats = async (req, res) => {

    try {
        const total = await orderSchema.countDocuments()
        const newRequest = await orderSchema.countDocuments({ status: 0 })
        const docsDelievered = await orderSchema.countDocuments({ status: 1 })

        const totalCorporateRequests = await orderSchema.aggregate([
            {
                $lookup: {
                    from: "paymentschemas",
                    localField: "paymentInfo",
                    foreignField: "_id",
                    as: "result"
                }
            },

            {
                $match: {
                    "result.productInfo": /corporate/i,
                }
            },

            {
                $count: 'totaldocuments'
            }

        ])

        const newCorporateRequest = await orderSchema.aggregate([
            {
                $lookup: {
                    from: "paymentschemas",
                    localField: "paymentInfo",
                    foreignField: "_id",
                    as: "result"
                }
            },

            {
                $match: {
                    "result.productInfo": /corporate/i,
                    status: 0
                }
            },

            {
                $count: 'totaldocuments'
            }

        ])

        const deliveredCorporateRequest = await orderSchema.aggregate([
            {
                $lookup: {
                    from: "paymentschemas",
                    localField: "paymentInfo",
                    foreignField: "_id",
                    as: "result"
                }
            },

            {
                $match: {
                    "result.productInfo": /corporate/i,
                    status: 1
                }
            },

            {
                $count: 'totaldocuments'
            }

        ])


        if (total || newRequest || docsDelievered) {
            return res.status(200).json({
                total: total, new_request: newRequest, delivered: docsDelievered,
                total_corporate_requests: totalCorporateRequests, newCorporateRequest: newCorporateRequest,
                deliveredCorporateRequest: deliveredCorporateRequest
            })
        } else {
            return res.status(400).json({ msg: "something went wrong" })
        }
    } catch (error) {
        return res.status(400).json(error.message)
    }

}


const uploadDoc = async (req, res) => {
    const orderid = req.params.id

    var file = req.file
    try {
        if (file) {
            orderSchema.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(orderid) }, {
                $set: {
                    doc: file.filename,
                    status: 1
                }
            }).then((resp) => {
                return res.status(200).json({ msg: 'Document uploaded' })
            }).catch((err) => {
                return res.status(400).json(err.message)
            })
        } else {
            return res.status(400).json({ msg: "Please attach document to upload" })
        }
    } catch (error) {
        return res.status(400).json(error.message)
    }
}





// const contactUs = async (req, res) => {
//     const { email, name, yearsOfExperience, phone, message } = req.body
//     var file = req.file
//     const mailOptions = {
//         from: process.env.EMAIL,
//         to: email,
//         subject: "Query Response",
//         text: `Hello ${name}, 
//                     Thanks for the query submission. we'll contact you shortly`,

//     }


//     const queryOptions = {
//         from: process.env.EMAIL,
//         to: process.env.EMAIL,
//         subject: 'New Contact Form Submission',
//         text: `A new contact form submission has been received. Here are the details:

//         Name: ${name}
//         Email: ${email}
//         Message: ${message}
//         YearsOfExperience:${yearsOfExperience}
//         phone:${phone}
//         `
//     }


//     if (file) {
//         queryOptions.attachments = [
//             {
//                 filename: file.filename,  // The name you want for the attachment
//                 path: path.join(__dirname, '..', 'public', file.filename),  // The path to your document file
//                 cid: 'document'  // Content-ID for referencing in the HTML body
//             }
//         ]
//     }

//     try {
//         sendMail(queryOptions).then(result => {
//             if (result) {
//                 sendMail(mailOptions).then(result => {
//                     if (result) {
//                         return res.status(200).json({ msg: 'Email sent' })
//                     } else {
//                         return res.status(400).json({ msg: "failed to send email" })
//                     }
//                 }).catch(err => {
//                     return res.status(400).json(err.message)
//                 })
//             } else {
//                 return res.status(400).json({ msg: "Failed to sent mail" })
//             }
//         }).catch(err => {
//             return res.status(400).json(err.message)
//         })
//     } catch (error) {
//         return res.status(400).json(error.message)
//     }

// }


const contactUs = async (req, res) => {
    const { email, name, yearsOfExperience, phone, message, category } = req.body;
    const file = req.file;

    const contactData = {
        email,
        category,
        name,
        yearsOfExperience,
        phone,
        message,
        filename: file ? file.filename : null,
    };

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Query Response',
        text: `Hello ${name}, Thanks for the query submission. We'll contact you shortly`,
    };

    const queryOptions = {
        from: process.env.EMAIL,
        to: process.env.EMAIL,
        subject: 'New Contact Form Submission',
        text: `A new contact form submission has been received. Here are the details:\n
            Name: ${name}\n
            Email: ${email}\n
            Message: ${message}\n
            YearsOfExperience: ${yearsOfExperience}\n
            Phone: ${phone}\n`,
    };

    if (file) {
        queryOptions.attachments = [
            {
                filename: file.filename,
                path: path.join(__dirname, '..', 'public', file.filename),
                cid: 'document',
            },
        ];
    }

    try {
        const savedContact = await Contact.create(contactData);

        sendMail(queryOptions)
            .then((result) => {
                if (result) {
                    sendMail(mailOptions)
                        .then(() => res.status(200).json({ msg: 'Email sent' }))
                        .catch((err) => res.status(400).json({ msg: 'Failed to send email', error: err.message }));
                } else {
                    res.status(400).json({ msg: 'Failed to send mail' });
                }
            })
            .catch((err) => res.status(400).json({ msg: 'Failed to send mail', error: err.message }));
    } catch (error) {
        res.status(400).json({ msg: 'Error saving contact data', error: error.message });
    }
};

// Add a new function to get contact data sorted by creation date
const getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find({}).sort({ createdAt: -1 });
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ msg: 'Error fetching contacts', error: error.message });
    }
};


























const getAppointments = async (req, res) => {

    try {
        const appointmentList = await appointmentSchema.find({}).sort({ createdAt: -1 }).select('-createdAt -updatedAt')
        if (appointmentList.length > 0) {
            return res.status(200).json(appointmentList)
        } else {
            return res.status(400).json({ msg: 'No appointment are there' })
        }
    } catch (error) {
        return res.status(400).json(error.message)
    }
}


const scheduleAppointment = async (req, res) => {
    const id = req.params.id
    const { date, time } = req.body
    try {
        appointmentSchema.findOneAndUpdate({ _id: id }, {
            $set: {
                date, time, scheduled: true
            }
        }, { new: true }).then(result => {
            const mailOptions = {
                from: process.env.EMAIL,
                to: result.email,
                subject: `Call Appointment Scheduled with acap`,
                text: `Dear ${result.name},
                            Your call appointment with acap is scheduled on ${date} at ${time}.If you need any 
                            assistance kindly leave a reply.
                        `
            }

            sendMail(mailOptions).then(result => {
                if (result) {
                    return res.status(200).json({ msg: "Appointment Scheduled" })
                } else {
                    return res.status(400).json({ msg: "something went wrong" })
                }
            }).catch(err => {
                return res.status(400).json(err.message)
            })
        }).catch(err => {
            return res.status(400).json(err.message)
        })
    } catch (error) {
        return res.status(400).json(error.message)
    }
}

const exportToCsv = async (req, res) => {

    try {
        csvMaker(orderSchema)
    } catch (error) {
        return res.status(200).json(error.message)
    }
}

module.exports = {
    adminRegisteration, getContacts, updateOrderStatus, listOrders, fetchOrderDetails, exportToCsv,
    getStats, uploadDoc, contactUs, login, getNewRequests, getDocsDelivered, getAppointments, scheduleAppointment
}