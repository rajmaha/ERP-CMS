const express = require('express');
const router = express.Router();
const axios = require('axios');
const ProductEnquiry = require('../models/ProductEnquiry');
const Settings = require('../models/Settings');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorHandler = require('../middleware/errorHandler');
const { sendEmail } = require('../utils/emailService');

// @route   POST /api/product-enquiries
// @desc    Submit product enquiry
// @access  Public
router.post('/', asyncHandler(async (req, res, next) => {
  const { recaptchaToken } = req.body;

  // Get settings to check if reCAPTCHA is enabled
  const settings = await Settings.findOne();

  // Verify reCAPTCHA only if enabled in settings
  if (settings && settings.enableRecaptchaProductEnquiry && settings.recaptchaSecretKey) {
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

  const enquiry = await ProductEnquiry.create(req.body);

  // Send email notification to admin
  try {
    const settings = await Settings.findOne();
    
    // Check if email notifications are enabled for product enquiries
    if (settings && settings.email && settings.enableEmailProductEnquiry !== false) {
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
              New Product Enquiry
            </h2>
            
            <div style="background-color: #eff6ff; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
              <p style="margin: 0; color: #1f2937; font-weight: 600;">Product: ${enquiry.productName}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                <strong style="color: #1f2937;">Name:</strong> ${enquiry.name}
              </p>
              <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                <strong style="color: #1f2937;">Email:</strong> 
                <a href="mailto:${enquiry.email}" style="color: #2563eb; text-decoration: none;">${enquiry.email}</a>
              </p>
              ${enquiry.phone ? `
                <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                  <strong style="color: #1f2937;">Phone:</strong> ${enquiry.phone}
                </p>
              ` : ''}
            </div>
            
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb;">
              <p style="margin: 0 0 10px 0; color: #1f2937; font-weight: 600;">Message:</p>
              <p style="margin: 0; color: #4b5563; line-height: 1.6; white-space: pre-wrap;">${enquiry.message}</p>
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 5px 0; color: #9ca3af; font-size: 12px;">
                Received: ${new Date(enquiry.createdAt).toLocaleString()}
              </p>
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/product-enquiries" 
                 style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
                View in Admin Panel
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>This is an automated notification from your product enquiry form.</p>
          </div>
        </div>
      `;

      await sendEmail({
        to: settings.email,
        subject: `New Product Enquiry: ${enquiry.productName}`,
        html: emailHtml
      }, smtpSettings);

      console.log(`Product enquiry notification sent to ${settings.email}`);
    }
  } catch (emailError) {
    console.error('Failed to send product enquiry notification email:', emailError);
    // Don't fail the request if email fails
  }

  res.status(201).json({
    success: true,
    data: enquiry
  });
}));

// @route   GET /api/product-enquiries/admin
// @desc    Get all product enquiries (admin)
// @access  Private/Admin
router.get('/admin', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { status } = req.query;
  
  let query = {};
  if (status) query.status = status;
  
  const enquiries = await ProductEnquiry.find(query)
    .populate('product', 'name thumbnailImage')
    .sort({ createdAt: -1 });
  
  res.json({ success: true, data: enquiries });
}));

// @route   PUT /api/product-enquiries/:id
// @desc    Update enquiry status
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const enquiry = await ProductEnquiry.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  );
  
  if (!enquiry) {
    return next(new ErrorHandler('Enquiry not found', 404));
  }
  
  res.json({ success: true, data: enquiry });
}));

// @route   DELETE /api/product-enquiries/:id
// @desc    Delete enquiry
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const enquiry = await ProductEnquiry.findById(req.params.id);
  
  if (!enquiry) {
    return next(new ErrorHandler('Enquiry not found', 404));
  }
  
  await ProductEnquiry.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

module.exports = router;
