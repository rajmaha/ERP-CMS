const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const JobPosting = require('../models/JobPosting');
const JobApplication = require('../models/JobApplication');
const Department = require('../models/Department');
const Settings = require('../models/Settings');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorHandler = require('../middleware/errorHandler');
const axios = require('axios');
const { shareToSocialMedia } = require('../utils/socialShare');
const { sendEmail } = require('../utils/emailService');

// Configure multer for resume uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/resumes/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});

// Job Postings Routes

// @route   GET /api/jobs
// @desc    Get all active jobs (public)
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const { department, location, employmentType, experienceLevel } = req.query;
  
  let query = { status: 'active' };
  
  if (department) query.department = department;
  if (location) query.location = location;
  if (employmentType) query.employmentType = employmentType;
  if (experienceLevel) query.experienceLevel = experienceLevel;
  
  const jobs = await JobPosting.find(query)
    .populate('department', 'name slug color icon')
    .sort({ createdAt: -1 });
  
  res.json({ success: true, data: jobs });
}));

// @route   GET /api/jobs/:slug
// @desc    Get single job by slug
// @access  Public
router.get('/:slug', asyncHandler(async (req, res, next) => {
  const job = await JobPosting.findOne({ slug: req.params.slug, status: 'active' })
    .populate('author', 'name')
    .populate('department', 'name slug color icon');
  
  if (!job) {
    return next(new ErrorHandler('Job not found', 404));
  }
  
  job.views += 1;
  await job.save();
  
  res.json({ success: true, data: job });
}));

// @route   GET /api/jobs/admin/all
// @desc    Get all jobs (admin)
// @access  Private/Admin
router.get('/admin/all', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { status } = req.query;
  
  let query = {};
  if (status) query.status = status;
  
  const jobs = await JobPosting.find(query)
    .populate('postedBy', 'name')
    .sort({ createdAt: -1 });
  
  res.json({ success: true, data: jobs });
}));

// @route   POST /api/jobs
// @desc    Create job posting
// @access  Private/Admin
router.post('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const job = await JobPosting.create({
    ...req.body,
    postedBy: req.user.id
  });

  // Auto-share if status is active
  if (job.status === 'active') {
    const description = job.description.replace(/<[^>]*>/g, '').substring(0, 200);
    shareToSocialMedia('job', {
      title: job.title,
      description: description,
      slug: job.slug,
      imageUrl: null
    }).catch(err => console.error('Social share error:', err));
  }

  res.status(201).json({ success: true, data: job });
}));

// @route   PUT /api/jobs/:id
// @desc    Update job posting
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  let job = await JobPosting.findById(req.params.id);

  if (!job) {
    return next(new ErrorHandler('Job not found', 404));
  }

  const wasInactive = job.status !== 'active';
  
  job = await JobPosting.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Share if status changed to active
  if (wasInactive && job.status === 'active') {
    const description = job.description.replace(/<[^>]*>/g, '').substring(0, 200);
    shareToSocialMedia('job', {
      title: job.title,
      description: description,
      slug: job.slug,
      imageUrl: null
    }).catch(err => console.error('Social share error:', err));
  }

  res.json({ success: true, data: job });
}));

// @route   DELETE /api/jobs/:id
// @desc    Delete job posting
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const job = await JobPosting.findById(req.params.id);
  
  if (!job) {
    return next(new ErrorHandler('Job not found', 404));
  }
  
  await JobPosting.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

// Job Applications Routes

// @route   POST /api/jobs/:jobId/apply
// @desc    Submit job application
// @access  Public
router.post('/:jobId/apply', upload.single('resume'), asyncHandler(async (req, res, next) => {
  const job = await JobPosting.findById(req.params.jobId);
  
  if (!job) {
    return next(new ErrorHandler('Job not found', 404));
  }
  
  if (job.status !== 'active') {
    return next(new ErrorHandler('This job is no longer accepting applications', 400));
  }

  // Get settings to check if reCAPTCHA is enabled
  const settings = await Settings.findOne();

  // Verify reCAPTCHA only if enabled in settings
  const { recaptchaToken } = req.body;
  if (settings && settings.enableRecaptchaJobApply && settings.recaptchaSecretKey) {
    try {
      const recaptchaResponse = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify`,
        null,
        {
          params: {
            secret: settings.recaptchaSecretKey,
            response: recaptchaToken
          }
        }
      );

      if (!recaptchaResponse.data.success) {
        return next(new ErrorHandler('reCAPTCHA verification failed', 400));
      }
    } catch (err) {
      console.error('reCAPTCHA verification error:', err);
      return next(new ErrorHandler('reCAPTCHA verification error', 500));
    }
  }
  
  const applicationData = {
    job: req.params.jobId,
    ...req.body,
    resume: req.file ? `/uploads/resumes/${req.file.filename}` : null
  };
  
  const application = await JobApplication.create(applicationData);
  
  job.applicationCount += 1;
  await job.save();

  // Send email notification to admin
  try {
    const settings = await Settings.findOne();
    
    // Check if email notifications are enabled for job applications
    if (settings && settings.email && settings.enableEmailJobApplication !== false) {
      const smtpSettings = settings.smtpHost ? {
        host: settings.smtpHost,
        port: parseInt(settings.smtpPort) || 587,
        secure: settings.smtpSecure || false,
        auth: {
          user: settings.smtpUser,
          pass: settings.smtpPassword
        },
        fromEmail: settings.smtpFromEmail,
        fromName: settings.smtpFromName || settings.siteName || 'ERP CMS'
      } : null;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #2563eb; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
              New Job Application
            </h2>
            
            <div style="background-color: #eff6ff; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
              <p style="margin: 0; color: #1f2937; font-weight: 600;">Position: ${job.title}</p>
              <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">${job.department} • ${job.location}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                <strong style="color: #1f2937;">Name:</strong> ${application.firstName} ${application.lastName}
              </p>
              <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                <strong style="color: #1f2937;">Email:</strong> 
                <a href="mailto:${application.email}" style="color: #2563eb; text-decoration: none;">${application.email}</a>
              </p>
              <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                <strong style="color: #1f2937;">Phone:</strong> ${application.phone}
              </p>
              <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                <strong style="color: #1f2937;">Experience:</strong> ${application.experience} years
              </p>
              ${application.currentCompany ? `
                <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                  <strong style="color: #1f2937;">Current Company:</strong> ${application.currentCompany}
                </p>
              ` : ''}
              ${application.currentPosition ? `
                <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                  <strong style="color: #1f2937;">Current Position:</strong> ${application.currentPosition}
                </p>
              ` : ''}
              ${application.expectedSalary ? `
                <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                  <strong style="color: #1f2937;">Expected Salary:</strong> ${application.expectedSalary}
                </p>
              ` : ''}
              ${application.noticePeriod ? `
                <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                  <strong style="color: #1f2937;">Notice Period:</strong> ${application.noticePeriod}
                </p>
              ` : ''}
            </div>
            
            ${application.coverLetter ? `
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb; margin-bottom: 15px;">
                <p style="margin: 0 0 10px 0; color: #1f2937; font-weight: 600;">Cover Letter:</p>
                <p style="margin: 0; color: #4b5563; line-height: 1.6; white-space: pre-wrap;">${application.coverLetter}</p>
              </div>
            ` : ''}
            
            ${application.linkedin || application.portfolio ? `
              <div style="margin-bottom: 20px;">
                ${application.linkedin ? `
                  <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                    <strong style="color: #1f2937;">LinkedIn:</strong> 
                    <a href="${application.linkedin}" style="color: #2563eb; text-decoration: none;">${application.linkedin}</a>
                  </p>
                ` : ''}
                ${application.portfolio ? `
                  <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                    <strong style="color: #1f2937;">Portfolio:</strong> 
                    <a href="${application.portfolio}" style="color: #2563eb; text-decoration: none;">${application.portfolio}</a>
                  </p>
                ` : ''}
              </div>
            ` : ''}
            
            ${application.resume ? `
              <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  📎 Resume attached: ${application.resume.split('/').pop()}
                </p>
              </div>
            ` : ''}
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 5px 0; color: #9ca3af; font-size: 12px;">
                Applied: ${new Date(application.createdAt).toLocaleString()}
              </p>
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/jobs/applications" 
                 style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
                View Application
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>This is an automated notification from your job application system.</p>
          </div>
        </div>
      `;

      await sendEmail({
        to: settings.email,
        subject: `New Job Application: ${job.title} - ${application.firstName} ${application.lastName}`,
        html: emailHtml
      }, smtpSettings);

      console.log(`Job application notification sent to ${settings.email}`);
    }
  } catch (emailError) {
    console.error('Failed to send job application notification email:', emailError);
    // Don't fail the request if email fails
  }
  
  res.status(201).json({ success: true, data: application });
}));

// @route   GET /api/jobs/applications/all
// @desc    Get all applications (admin)
// @access  Private/Admin
router.get('/applications/all', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { status, jobId } = req.query;
  
  let query = {};
  if (status) query.status = status;
  if (jobId) query.job = jobId;
  
  const applications = await JobApplication.find(query)
    .populate('job', 'title department')
    .sort({ appliedAt: -1 });
  
  res.json({ success: true, data: applications });
}));

// @route   GET /api/jobs/applications/:id
// @desc    Get single application
// @access  Private/Admin
router.get('/applications/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const application = await JobApplication.findById(req.params.id)
    .populate('job')
    .populate('reviewedBy', 'name');
  
  if (!application) {
    return next(new ErrorHandler('Application not found', 404));
  }
  
  res.json({ success: true, data: application });
}));

// @route   PUT /api/jobs/applications/:id
// @desc    Update application status
// @access  Private/Admin
router.put('/applications/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const application = await JobApplication.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      reviewedBy: req.user.id,
      reviewedAt: Date.now()
    },
    { new: true, runValidators: true }
  );
  
  if (!application) {
    return next(new ErrorHandler('Application not found', 404));
  }
  
  res.json({ success: true, data: application });
}));

// @route   DELETE /api/jobs/applications/:id
// @desc    Delete application
// @access  Private/Admin
router.delete('/applications/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const application = await JobApplication.findById(req.params.id);
  
  if (!application) {
    return next(new ErrorHandler('Application not found', 404));
  }
  
  await JobApplication.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

// Department Routes

// @route   GET /api/jobs/departments/list
// @desc    Get all departments
// @access  Public
router.get('/departments/list', asyncHandler(async (req, res) => {
  const departments = await Department.find({ isActive: true }).sort({ name: 1 });
  res.json({ success: true, data: departments });
}));

// @route   GET /api/jobs/departments/admin
// @desc    Get all departments (admin)
// @access  Private/Admin
router.get('/departments/admin', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const departments = await Department.find().sort({ createdAt: -1 });
  res.json({ success: true, data: departments });
}));

// @route   POST /api/jobs/departments
// @desc    Create department
// @access  Private/Admin
router.post('/departments', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const department = await Department.create({
    ...req.body,
    slug: req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  });
  res.status(201).json({ success: true, data: department });
}));

// @route   PUT /api/jobs/departments/:id
// @desc    Update department
// @access  Private/Admin
router.put('/departments/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const department = await Department.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!department) {
    return next(new ErrorHandler('Department not found', 404));
  }
  
  res.json({ success: true, data: department });
}));

// @route   DELETE /api/jobs/departments/:id
// @desc    Delete department
// @access  Private/Admin
router.delete('/departments/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const department = await Department.findById(req.params.id);
  
  if (!department) {
    return next(new ErrorHandler('Department not found', 404));
  }
  
  await Department.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

module.exports = router;
