const express = require('express')

const payrouter = express.Router()

const bodyParser = require('body-parser')
const {createPaymenrequest, payU_callback, fetchPaymentDetails } = require('../controlller/paymentController')

const jsonparser = bodyParser.json()

payrouter.post('/create', jsonparser, createPaymenrequest)
payrouter.post('/response', jsonparser, payU_callback)
payrouter.get('/fetch-details/:id', jsonparser, fetchPaymentDetails)


module.exports = payrouter