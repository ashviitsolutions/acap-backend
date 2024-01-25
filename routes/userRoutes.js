const express = require('express')

const userRouter= express.Router()

const bodyParser = require('body-parser')
const { saveFormData, downloadFile, trackOrder, bookCallAppointment } = require('../controlller/userContoller')
const { upload } = require('../middleware/mediaUpload')

const jsonparser = bodyParser.json()


userRouter.post('/form-submit/:id',upload.array('file',3) ,jsonparser, saveFormData)
userRouter.get('/:id/download', downloadFile)
userRouter.post('/track-order', jsonparser, trackOrder)
userRouter.post('/call-appointment',upload.array('file') ,jsonparser, bookCallAppointment)

module.exports = userRouter