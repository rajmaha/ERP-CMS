const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Contact = require('../models/Contact');
const Settings = require('../models/Settings');
const { protect, authorize } = require('../middleware/auth');
const handleValidationErrors = require('../middleware/validation');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorHandler = require('../middleware/errorHandler');
const axios = require('axios');
const { sendEmail } = require('../utils/emailService');

// @route   GET /api/contact/admin
// @desc    Get all contacts (admin)
// @access  Private/Admin
router.get('/admin', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { status } = req.query;
  
  let query = {};
  if (status === 'read') query.isRead = true;
  if (status === 'unread') query.isRead = false;
  
  const contacts = await Contact.find(query).sort({ createdAt: -1 });
  res.json({ success: true, data: contacts });
}));

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', asyncHandler(async (req, res, next) => {
  const { recaptchaToken } = req.body;

  // Get settings to check if reCAPTCHA is enabled
  const settings = await Settings.findOne();
  
  // Verify reCAPTCHA only if enabled in settings
  if (settings && settings.enableRecaptchaContact && settings.recaptchaSecretKey) {
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

  const contact = await Contact.create(req.body);

  // Send email notification to admin
  try {
    const settings = await Settings.findOne();
    
    // Check if email notifications are enabled for contact form
    if (settings && settings.email && settings.enableEmailContact !== false) {
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
              New Contact Form Submission
            </h2>
            
            <div style="margin-bottom: 20px;">
              <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                <strong style="color: #1f2937;">Name:</strong> ${contact.name}
              </p>
              <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                <strong style="color: #1f2937;">Email:</strong> 
                <a href="mailto:${contact.email}" style="color: #2563eb; text-decoration: none;">${contact.email}</a>
              </p>
              ${contact.phone ? `
                <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                  <strong style="color: #1f2937;">Phone:</strong> ${contact.phone}
                </p>
              ` : ''}
              ${contact.subject ? `
                <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                  <strong style="color: #1f2937;">Subject:</strong> ${contact.subject}
                </p>
              ` : ''}
            </div>
            
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb;">
              <p style="margin: 0 0 10px 0; color: #1f2937; font-weight: 600;">Message:</p>
              <p style="margin: 0; color: #4b5563; line-height: 1.6; white-space: pre-wrap;">${contact.message}</p>
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 5px 0; color: #9ca3af; font-size: 12px;">
                Received: ${new Date(contact.createdAt).toLocaleString()}
              </p>
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/contacts" 
                 style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
                View in Admin Panel
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>This is an automated notification from your website contact form.</p>
          </div>
        </div>
      `;

      await sendEmail({
        to: settings.email,
        subject: `New Contact Message: ${contact.subject || 'No Subject'}`,
        html: emailHtml
      }, smtpSettings);

      console.log(`Contact notification sent to ${settings.email}`);
    }
  } catch (emailError) {
    console.error('Failed to send contact notification email:', emailError);
    // Don't fail the request if email fails
  }

  res.status(201).json({
    success: true,
    data: contact
  });
}));

// @route   GET /api/contact/:id
// @desc    Get single contact
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);
  
  if (!contact) {
    return next(new ErrorHandler('Contact not found', 404));
  }
  
  res.json({ success: true, data: contact });
}));

// @route   PUT /api/contact/:id
// @desc    Update contact (mark as read/unread)
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!contact) {
    return next(new ErrorHandler('Contact not found', 404));
  }
  
  res.json({ success: true, data: contact });
}));

// @route   DELETE /api/contact/:id
// @desc    Delete contact
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);
  
  if (!contact) {
    return next(new ErrorHandler('Contact not found', 404));
  }
  
  await Contact.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

module.exports = router;
