const express = require('express');
const router = express.Router();
const axios = require('axios');
const DynamicForm = require('../models/DynamicForm');
const FormSubmission = require('../models/FormSubmission');
const Settings = require('../models/Settings');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorHandler = require('../middleware/errorHandler');
const { sendEmail } = require('../utils/emailService');

// @route   GET /api/forms
// @desc    Get all active forms (public)
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const forms = await DynamicForm.find({ status: 'active' })
    .select('-fields.validation')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: forms });
}));

// @route   GET /api/forms/:slug
// @desc    Get form by slug
// @access  Public
router.get('/:slug', asyncHandler(async (req, res, next) => {
  const form = await DynamicForm.findOne({ slug: req.params.slug, status: 'active' });
  
  if (!form) {
    return next(new ErrorHandler('Form not found', 404));
  }
  
  res.json({ success: true, data: form });
}));

// @route   POST /api/forms/:id/submit
// @desc    Submit form response
// @access  Public
router.post('/:id/submit', asyncHandler(async (req, res, next) => {
  const form = await DynamicForm.findById(req.params.id);
  
  if (!form) {
    return next(new ErrorHandler('Form not found', 404));
  }
  
  if (form.status !== 'active') {
    return next(new ErrorHandler('This form is no longer accepting submissions', 400));
  }

  // Verify reCAPTCHA if enabled
  const { recaptchaToken, responses } = req.body;
  if (form.enableRecaptcha) {
    const settings = await Settings.findOne();
    if (settings && settings.recaptchaSecretKey) {
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
  }

  // Create submission
  const submission = await FormSubmission.create({
    form: form._id,
    formTitle: form.title,
    responses: responses,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  // Update submission count
  form.submissionCount += 1;
  await form.save();

  // Send email notification to admin
  try {
    const settings = await Settings.findOne();
    
    // Use form-specific email or fallback to settings email
    const notificationEmail = form.notificationEmail || settings?.email;
    
    // Check if email notifications are enabled for dynamic forms (global setting) AND form-specific setting
    if (notificationEmail && settings?.enableEmailDynamicForms !== false && form.emailNotifications !== false) {
      const smtpSettings = settings?.smtpHost ? {
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

      // Build responses section
      const responsesHtml = responses.map(r => {
        // Handle different value types
        let displayValue = r.value;
        if (Array.isArray(r.value)) {
          displayValue = r.value.join(', ');
        } else if (typeof r.value === 'object') {
          displayValue = JSON.stringify(r.value);
        }
        
        return `
          <div style="margin-bottom: 15px; padding: 10px; background-color: #f9fafb; border-radius: 4px;">
            <p style="margin: 0 0 5px 0; color: #1f2937; font-weight: 600; font-size: 14px;">${r.label}</p>
            <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${displayValue || '(No response)'}</p>
          </div>
        `;
      }).join('');

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #2563eb; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
              New Form Submission
            </h2>
            
            <div style="background-color: #eff6ff; padding: 15px; border-radius: 6px; margin-bottom: 25px;">
              <p style="margin: 0; color: #1f2937; font-weight: 600; font-size: 16px;">${form.title}</p>
              ${form.description ? `
                <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">${form.description}</p>
              ` : ''}
            </div>
            
            <div style="margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px;">Form Responses:</h3>
              ${responsesHtml}
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 5px 0; color: #6b7280; font-size: 12px;">
                <strong style="color: #1f2937;">Submitted:</strong> ${new Date(submission.submittedAt).toLocaleString()}
              </p>
              ${submission.ipAddress ? `
                <p style="margin: 5px 0; color: #6b7280; font-size: 12px;">
                  <strong style="color: #1f2937;">IP Address:</strong> ${submission.ipAddress}
                </p>
              ` : ''}
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/forms" 
                 style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
                View All Submissions
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>This is an automated notification from your ${form.title} form.</p>
          </div>
        </div>
      `;

      await sendEmail({
        to: notificationEmail,
        subject: `New Form Submission: ${form.title}`,
        html: emailHtml
      }, smtpSettings);

      console.log(`Dynamic form submission notification sent to ${notificationEmail}`);
    }
  } catch (emailError) {
    console.error('Failed to send dynamic form notification email:', emailError);
    // Don't fail the request if email fails
  }

  res.status(201).json({
    success: true,
    message: form.successMessage,
    data: submission
  });
}));

// Admin Routes

// @route   GET /api/forms/admin/all
// @desc    Get all forms (admin)
// @access  Private/Admin
router.get('/admin/all', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const forms = await DynamicForm.find()
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: forms });
}));

// @route   POST /api/forms/admin
// @desc    Create form
// @access  Private/Admin
router.post('/admin', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const form = await DynamicForm.create({
    ...req.body,
    createdBy: req.user.id,
    slug: req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  });
  res.status(201).json({ success: true, data: form });
}));

// @route   PUT /api/forms/admin/:id
// @desc    Update form
// @access  Private/Admin
router.put('/admin/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const form = await DynamicForm.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );
  
  if (!form) {
    return next(new ErrorHandler('Form not found', 404));
  }
  
  res.json({ success: true, data: form });
}));

// @route   DELETE /api/forms/admin/:id
// @desc    Delete form
// @access  Private/Admin
router.delete('/admin/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const form = await DynamicForm.findById(req.params.id);
  
  if (!form) {
    return next(new ErrorHandler('Form not found', 404));
  }
  
  await DynamicForm.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

// @route   GET /api/forms/admin/:id/submissions
// @desc    Get form submissions
// @access  Private/Admin
router.get('/admin/:id/submissions', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const submissions = await FormSubmission.find({ form: req.params.id })
    .sort({ submittedAt: -1 });
  res.json({ success: true, data: submissions });
}));

// @route   DELETE /api/forms/admin/submissions/:id
// @desc    Delete submission
// @access  Private/Admin
router.delete('/admin/submissions/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const submission = await FormSubmission.findById(req.params.id);
  
  if (!submission) {
    return next(new ErrorHandler('Submission not found', 404));
  }
  
  await FormSubmission.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

module.exports = router;
