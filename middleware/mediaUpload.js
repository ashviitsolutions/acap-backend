const multer = require('multer')

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public')
    },

    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
})

const upload = multer({
    storage: multerStorage,
})


module.exports = { upload }