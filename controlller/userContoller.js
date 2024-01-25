const { default: mongoose } = require('mongoose')
const orderSchema = require('../models/orders')
const { User, WorkExperience, Project, Education, Achievement, Award } = require('../models/userandFormDetails')
const fs = require('fs')
const path= require('path')
const appointmentSchema = require('../models/appointment')
const { sendMail } = require('../utils/sendMail')





const saveFormData = async (req, res) => {
    const { name,email,phone, address, linkedin, dateOfBirth,
        yearsOfExperience, industry, currentDesignation,
        currentCompany, skype
    } = req.body

    var files = req.files
    const workExperiences = req.body.workExperiences
    const projects = req.body.projects
    const savedWorkedExperience = []
    const savedProjects = []
    const savedEducation = []
    const savedachievements = []
    const savedAwards = []
    let docs =[]

    try {

        
        if (workExperiences) {
            for (const experience of workExperiences) {
                const { company, designation, tenure, role } = experience;

                // Create a new instance of the WorkExperience model
                const workExperience = new WorkExperience({
                    company,
                    designation,
                    tenure,
                    role
                });

                savedWorkedExperience.push(workExperience);
            }
        }

        if (projects) {
            for (const project of projects) {
                const { projectTitle, company, clientName, role, tenure } = project;

                // Create a new instance of the WorkExperience model
                const projectExp = new Project({
                    projectTitle,
                    company,
                    clientName,
                    role,
                    tenure
                });

                savedProjects.push(projectExp);
            }
        }

        if (req.body.educations) {
            for (const education of req.body.educations) {
                const { degree, institute, year, name } = education

                const educationDetail = new Education({
                    degree,
                    institute,
                    year,
                    name
                })

                savedEducation.push(educationDetail)
            }
        }

        if (req.body.achievements) {
            for (const achievement of req.body.achievements) {
                const { company, achievements, tenure } = achievement

                const achievementss = new Achievement({
                    company,
                    achievements,
                    tenure
                })

                savedachievements.push(achievementss)
            }
        }

        if (req.body.awards) {
            for (const awardss of req.body.awards) {
                const { company, award, tenure } = awardss

                const awards = new Award({
                    company,
                    award,
                    tenure
                })

                savedAwards.push(awards)
            }
        }

        if (req.params.id) {
            const existingUser = await User.findOne({ _id: req.params.id })
            if (existingUser) {
                
                    existingUser.skills = {
                        softSkills: req.body.softSkills,
                        technicalSkills: req.body.technicalSkills,
                        industrySkills: req.body.industrySkills,
                        languageSkills: req.body.languageSkills
                    },
                    existingUser.workExperience = savedWorkedExperience,
                    existingUser.projects = savedProjects,
                    existingUser.achievements = savedachievements,
                    existingUser.awards = savedAwards;
                    existingUser.education=savedEducation

                if (req.body.formType === 'recruitmentSharing') {
                    existingUser.personalDetails = {
                    name, phone, email, address, linkedin, dateOfBirth, yearsOfExperience, skype,
                    industry, currentDesignation, currentCompany
                },
                    existingUser.recruitmentSharing = {
                        aspirations: {
                            targetDesignations: req.body.targetDesignations,
                            targetCompanies: req.body.targetCompanies,
                            targetJobLinks: req.body.targetJobLinks,
                        },
                        resumeIssues: req.body.resumeIssues,                        
			applicationChannels: req.body.applicationChannels,                        
			preferences:req.body.preferences
 		 }

                    if(files){
                        docs = files.map((file)=>{
                            return file.filename
                        })

                        existingUser.docs = docs
                    }

    
                }

                if (req.body.formType === 'linkedin') {
		  existingUser.personalDetails = {
                    name, phone, email, address, linkedin, dateOfBirth, yearsOfExperience, skype,
                    industry, currentDesignation, currentCompany
                  },
                    existingUser.linkedinRevamp = {
                        purpose: req.body.purpose,
                        problem: req.body.problem,
                        network: req.body.network,
                        engagementPosts: req.body.engagementPosts,
                    };
                }

                existingUser.save()
                    .then((updatedUser) => {
                        return res.status(200).json({ message: 'User document updated successfully' });
                    })
                    .catch((err) => {
                        return res.status(500).json({ error: 'An error occurred while updating user', msg: err.message });
                    });

            } else {
                return res.status(400).json({msg:"Bad Credentials"})
            }

        }else{
            return res.status(400).json({msg:"user not found"})
        }
    } catch (error) {
        return res.status(400).json(error.message)
    }
}

const downloadFile = async(req,res)=>{
    const orderid = req.params.id

    try {
        orderSchema.findOne({_id:mongoose.Types.ObjectId(orderid)}).then(resp=>{
            if(resp.doc){
                const path = process.env.FILE_PATH + resp.doc
                if(path){
                    fs.stat(path, (err, stats) => {
                        if (err) {
                          console.error(err);
                          return res.status(404).send('File not found');
                        }
                    
                        // Set the appropriate content type header
                        res.contentType('application/octet-stream');
                    
                        // Set the content disposition header to force download
                        res.setHeader('Content-Disposition', `attachment; filename=${resp.doc}`);
                    
                        // Stream the file
                        const fileStream = fs.createReadStream(path);
                        fileStream.pipe(res);
                    });
                }else{
                    return res.status(400).json({msg:'Invalid File Path'})
                }
            }else{
                return res.status(400).json({msg:"No document available"})
            }
        }).catch((err)=>{
            return res.status(400).json(err.message)
        })
    } catch (error) {
        return res.status(400).json(error.message)
    }
}


const trackOrder = async(req,res)=>{
    const orderid = req.body.orderId

    try {
        const order = await orderSchema.findOne({_id: new mongoose.Types.ObjectId(orderid)}).populate('userInfo')
        .populate('paymentInfo', 'transaction_id amount productInfo').select('-createdAt -updatedAt -doc')
    
        if(order){
            return res.status(200).json(order)
        }else{
            return res.status(400).json({msg:"Invalid Order ID"})
        }
    } catch (error) {
        return res.status(400).json(error.message)
    }
}


const bookCallAppointment = async(req,res)=>{
    const {name,email,phone,yearsOfExperience} = req.body

    var files = req.files
    let attachments=[]
   try {
     const appointment = new appointmentSchema({
         name,email,phone,yearsOfExperience
    })
 
    appointment.save().then((result)=>{
        const mailOptions = {
            from:process.env.EMAIL,
            to:email,
            subject: `Request for Appointment`,
            text: `Hello ${name}, 
                        We've recieved your request for call appointment. We'll get back to you shortly.`
        }
        if(files){
            attachments = files.map(file=>{
                return {filename:file.filename, path:path.join(__dirname,'..','public',file.filename)}
            })

            mailOptions.attachments=attachments
        }

        console.log('mail attachments', mailOptions.attachments)
        sendMail(mailOptions).then((result)=>{
            if(result){
                return res.status(200).json({msg:"Email sent"})
            }else{
                return res.status(400).json({msg:"Failed to send Email"})
            }
        }).catch(err=>{
            return res.status(400).json(err.message)
        })
    }).catch(err=>{
     return res.status(400).json(err.message)
    })
   } catch (error) {
        return res.status(400).json(error.message)
   }
}



module.exports = {saveFormData, downloadFile, trackOrder, bookCallAppointment}