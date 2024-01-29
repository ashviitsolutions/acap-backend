const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const payrouter = require('./routes/paymentRoute')
const packagerouter = require('./routes/packageRoutes')
const adminRouter = require('./admin/adminRoutes')
const userRouter = require('./routes/userRoutes')
const https = require('https')
const multer = require('multer');
const { auth } = require('./middleware/mediaUpload')
const fs = require('fs')
const path = require('path');
require('dotenv').config()


const privatekey = fs.readFileSync('./ssl/private_key.key')
const certificate = fs.readFileSync('./ssl/SSL.CRT')
const credentials = { key: privatekey, cert: certificate }

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


const storage = multer.diskStorage({
    destination: path.join(__dirname, 'public'),
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});
const upload = multer({ storage });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes


app.get('/image/:fileName', (req, res) => {
    const fileName = req.params.fileName;

    if (!fileName) {
        return res.status(400).json({ msg: 'File name is required' });
    }

    const filePath = path.join(__dirname, 'public', fileName);

    try {
        res.sendFile(filePath);
    } catch (error) {
        res.status(500).json({ msg: 'Error fetching image', error: error.message });
    }
});
// Add a new function to get PDF files
app.get('/pdf/:fileName', (req, res) => {
    const fileName = req.params.fileName;

    if (!fileName) {
        return res.status(400).json({ msg: 'File name is required' });
    }

    const filePath = path.join(__dirname, 'public', fileName);

    try {
        res.sendFile(filePath);
    } catch (error) {
        res.status(500).json({ msg: 'Error fetching PDF', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`)
})
