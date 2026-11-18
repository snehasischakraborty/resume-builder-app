const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: String,
    email: String,
    phone: String,
    address: String,
    summary: String,
    skills: [String],
    education: [{ degree: String, school: String, year: String }],
    experience: [{ role: String, company: String, duration: String, details: String }],
    projects: [{ title: String, details: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
