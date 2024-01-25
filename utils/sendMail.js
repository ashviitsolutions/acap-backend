const nodemailer = require('nodemailer')

// const sendMail =  async(req,res)=>{
//     const transporter = nodemailer.createTransport({
//         service : 'gmail',
//         port : 587,
//         secure : false,
//         auth:{
//             user:'Hellofromacap@gmail.com',
//             pass:'sgfaprjobquirgnb'
//         }
//     })

//     var configOptions = {
//         from:"Hellofromacap@gmail.com",
//         to:req.body.email,
//         subject:req.body.subject,
//         text:req.body.text
//     }

//     transporter.sendMail(configOptions, (err,info)=>{
//         if(err) return res.status(400).json(err.message)

//         return res.status(200).json({msg:"Email send succesfully"})
//     })

// }


async function sendMail({ from, to, subject, text}) {
    // Create a transporter using your email service provider's configuration
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        port : 587,
        secure : false,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_AUTH
        }
    });

    // Define the email options
    const mailOptions = {
        from: process.env.EMAIL, 
        to: to,
        subject: subject,
        text: text,
    };

    try {
        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        return true
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}


module.exports={sendMail}