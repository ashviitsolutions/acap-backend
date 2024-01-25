const express = require('express')
const packagerouter = express.Router()
const bodyParser = require('body-parser')
const { addPackage, fetchPackagePrice } = require('../controlller/packagesController')
const jsonparser = bodyParser.json()



packagerouter.post('/add',jsonparser, addPackage)
packagerouter.get('/price', jsonparser,fetchPackagePrice)

module.exports = packagerouter