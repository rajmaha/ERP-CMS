const mongoose = require('mongoose');

const JobApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosting',
    required: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  resume: {
    type: String,
    required: [true, 'Resume is required']
  },
  coverLetter: String,
  portfolio: String,
  linkedin: String,
  experience: {
    type: Number,
    required: true
  },
  currentCompany: String,
  currentPosition: String,
  expectedSalary: Number,
  noticePeriod: String,
  status: {
    type: String,
    enum: ['new', 'reviewing', 'shortlisted', 'interviewed', 'rejected', 'hired'],
    default: 'new'
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  notes: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  interviewScheduled: Date,
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('JobApplication', JobApplicationSchema);
