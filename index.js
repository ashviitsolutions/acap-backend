const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const payrouter = require('./routes/paymentRoute')
const packagerouter = require('./routes/packageRoutes')
const adminRouter = require('./admin/adminRoutes')
const userRouter = require('./routes/userRoutes')
const https = require('https')
const fs = require('fs')
require('dotenv').config()


const privatekey = fs.readFileSync('./ssl/private_key.key')
const certificate = fs.readFileSync('./ssl/SSL.CRT')
const credentials = {key:privatekey, cert:certificate}

const app = express()

const PORT = process.env.PORT || 4000

mongoose.connect(process.env.MONGO_DB_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log('DB connected successfully')
    }).catch((err) => {
        throw new Error("couldn't connect to database")
})


app.use(cors({
    // origin:'http://45.13.132.197:8081',
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}))

app.options('*', cors())

app.use(bodyParser.urlencoded({ extended: true }))

app.use('/api/payment', payrouter)
app.use('/api/package', packagerouter)
app.use('/api/admin', adminRouter)
app.use('/api/user', userRouter)

//const httpsserver = https.createServer(credentials,app)

//httpsserver.listen(PORT, ()=>{
  //  console.log(`server is running on ${PORT}`)
//})

app.listen(PORT, () => {
     console.log(`server is running on ${PORT}`)
})
