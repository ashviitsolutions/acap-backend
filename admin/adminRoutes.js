const express = require('express')

const adminRouter= express.Router()

const bodyParser = require('body-parser')
const { adminRegisteration, updateOrderStatus, listOrders, fetchOrderDetails, getStats, uploadDoc, contactUs, login, getNewRequests, getDocsDelivered, getAppointments, scheduleAppointment} = require('./adminController')
const { upload } = require('../middleware/mediaUpload')
const { auth } = require('../middleware/auth')
const jsonparser = bodyParser.json()


adminRouter.post('/register', jsonparser, adminRegisteration)
adminRouter.post('/login', jsonparser, login)
adminRouter.post('/contact-us', upload.single("file"),jsonparser, contactUs)
adminRouter.put('/update-status/:id', jsonparser, auth,updateOrderStatus )
adminRouter.put('/schedule/:id', auth, jsonparser, scheduleAppointment)
adminRouter.get('/orders', auth,listOrders)
adminRouter.get('/new-requests', auth, jsonparser, getNewRequests)
adminRouter.get('/docs-delivered', auth, jsonparser, getDocsDelivered)
adminRouter.get('/order/:id', auth, jsonparser,auth, fetchOrderDetails)
adminRouter.post('/upload/:id', auth,upload.single("doc"), uploadDoc)
adminRouter.get('/stats', auth, getStats)
adminRouter.get('/appointments', auth, getAppointments)

module.exports = adminRouter