const mongoose = require('mongoose');

// Define the schema for Personal Details
const personalDetailsSchema = new mongoose.Schema({
  name: { type: String},
  phone: { type: String},
  email: { type: String, required: true},
  address: { type: String},
  linkedin: { type: String},
  skype: { type: String },
  dateOfBirth: { type: String},
  yearsOfExperience: { type: Number},
  industry: { type: String},
  currentDesignation: { type: String},
  currentCompany: { type: String}
});

// Define the schema for Skills
const skillsSchema = new mongoose.Schema({
  softSkills: { type: [String]},
  technicalSkills: { type: [String]},
  industrySkills: { type: [String] },
  languageSkills: { type: [String] }
});

// Define the schema for Work Experience
const workExperienceSchema = new mongoose.Schema({
  company: { type: String},
  designation: { type: String},
  tenure: { type: String},
  role: { type: String}
});

// Define the schema for Projects
const projectsSchema = new mongoose.Schema({
  projectTitle: { type: String },
  company: { type: String },
  clientName: { type: String },
  tenure: { type: String },
  role: { type: String }
});

// Define the schema for Achievements
const achievementsSchema = new mongoose.Schema({
  company: { type: String },
  achievements: { type: String },
  tenure: { type: String }
});

// Define the schema for Awards
const awardsSchema = new mongoose.Schema({
  company: { type: String },
  award: { type: String },
  tenure: { type: String }
});

// Define the schema for Education
const educationSchema = new mongoose.Schema({
  degree: { type: String },
  institute: { type: String},
  year: { type: Number },
  name: { type: String}
});

// Define the schema for LinkedIn Profile Revamp
const linkedinRevampSchema = new mongoose.Schema({
  purpose: { type: String },
  problem: { type: String},
  network: { type: String},
  engagementPosts: { type: String}
});

// Define the schema for Recruitment Sharing
const recruitmentSharingSchema = new mongoose.Schema({
  aspirations: {
    targetDesignations: { type: [String]},
    targetCompanies: { type: [String]},
    targetJobLinks: { type: [String]}
  },

  resumeIssues: {
    type:Object
  },
  applicationChannels: {
    type:Object
  },
  preferences: {
    type:Object
  }
})

const userSchema = new mongoose.Schema({
  // Personal Details
  personalDetails: { type: personalDetailsSchema, required: true },
  // Skills
  skills: { type: skillsSchema},
  // Work Experience
  workExperience: [{ type: workExperienceSchema}],
  // Projects
  projects: [{ type: projectsSchema}],
  // Achievements
  achievements: [{ type: achievementsSchema}],
  // Awards
  awards: [{ type: awardsSchema}],
  // Education
  education: [{ type: educationSchema}],
  // LinkedIn Profile Revamp
  linkedinRevamp: { type: linkedinRevampSchema },
  // Recruitment Sharing
  recruitmentSharing: { type: recruitmentSharingSchema,},

  formType:{
    type:String
  },

  docs:{
   type:Array
},

  role:{
    type:Number,
    enum:[0,1],
    default:1
    //[0---->Admin, 1---->User]
  }
}, {timestamps:true});

const User = mongoose.model('User', userSchema);

// Define the model for Work Experience
const WorkExperience = mongoose.model('WorkExperience', workExperienceSchema);

// Define the model for Project
const Project = mongoose.model('Project', projectsSchema);

// Define the model for Achievement
const Achievement = mongoose.model('Achievement', achievementsSchema);

// Define the model for Award
const Award = mongoose.model('Award', awardsSchema);

// Define the model for Education
const Education = mongoose.model('Education', educationSchema);


module.exports = {
  User,
  WorkExperience,
  Project,
  Achievement,
  Award,
  Education,
};