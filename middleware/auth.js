const jwt = require('jsonwebtoken')
const { User } = require('../models/userandFormDetails')

const auth = async(req,res,next)=>{

    try {
        const header = req.headers['authorization']
        const token  = header && header.split(' ')[1]
        console.log(token)
        if(token===null){
            return res.status(401).json({ msg: "unauthorized" })
        }
    
        const verifyToken = jwt.verify(token, process.env.SECRET_KEY)
    
        if(verifyToken){
            const user = await User.findOne({_id:verifyToken._id})
            if(user.role===0){
                req.user = user
                next()
            }else{
                return res.status(401).json({msg:"unauthorized"})
            }
            
        }else{
            return res.status(400).json({ msg: "Invalid Token" })
        }
    } catch (error) {
        return res.status(400).json(error.message)
    }
}

module.exports = {auth}