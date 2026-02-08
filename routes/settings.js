const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

// @route   POST /api/settings/test-smtp
// @desc    Test SMTP connection
// @access  Private/Admin
router.post('/test-smtp', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const nodemailer = require('nodemailer');
  const { smtpHost, smtpPort, smtpUser, smtpPassword, smtpFromEmail, smtpSecure } = req.body;

  // Fetch from database if not provided in request
  let host = smtpHost;
  let port = smtpPort;
  let user = smtpUser;
  let password = smtpPassword;

  if (!host || !port || !user || !password) {
    const settings = await Settings.findOne();
    host = host || settings?.smtpHost || process.env.SMTP_HOST;
    port = port || settings?.smtpPort || process.env.SMTP_PORT;
    user = user || settings?.smtpUser || process.env.SMTP_USER;
    password = password || settings?.smtpPassword || process.env.SMTP_PASSWORD;
  }

  if (!host || !port || !user || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing SMTP configuration' 
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: host,
      port: parseInt(port),
      secure: smtpSecure || (port == 465),
      auth: {
        user: user,
        pass: password
      }
    });

    await transporter.verify();
    
    res.json({ 
      success: true, 
      message: 'SMTP connection successful' 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message || 'SMTP connection failed' 
    });
  }
}));

// @route   GET /api/settings
// @desc    Get settings (public - no auth required)
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  
  if (!settings) {
    settings = await Settings.create({
      siteName: 'ERP CMS',
      showLoginButton: true,
      showMap: true,
      mapUrl: ''
    });
  }
  
  res.json({ success: true, data: settings });
}));

// @route   POST /api/settings
// @desc    Update settings
// @access  Private/Admin
router.post('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  
  const updateData = {
    siteName: req.body.siteName || 'ERP CMS',
    siteDescription: req.body.siteDescription || '',
    logo: req.body.logo || '',
    favicon: req.body.favicon || '',
    email: req.body.email || '',
    phone: req.body.phone || '',
    address: req.body.address || '',
    facebook: req.body.facebook || '',
    twitter: req.body.twitter || '',
    linkedin: req.body.linkedin || '',
    instagram: req.body.instagram || '',
    youtube: req.body.youtube || '',
    metaTitle: req.body.metaTitle || '',
    metaDescription: req.body.metaDescription || '',
    metaKeywords: req.body.metaKeywords || '',
    googleAnalytics: req.body.googleAnalytics || '',
    ogTitle: req.body.ogTitle || '',
    ogDescription: req.body.ogDescription || '',
    ogImage: req.body.ogImage || '',
    ogType: req.body.ogType || 'website',
    googleTagManagerId: req.body.googleTagManagerId || '',
    facebookPixelId: req.body.facebookPixelId || '',
    smtpHost: req.body.smtpHost || '',
    smtpPort: req.body.smtpPort || '',
    smtpUser: req.body.smtpUser || '',
    smtpPassword: req.body.smtpPassword || '',
    smtpFromEmail: req.body.smtpFromEmail || '',
    smtpFromName: req.body.smtpFromName || '',
    smtpSecure: req.body.smtpSecure !== undefined ? req.body.smtpSecure : false,
    recaptchaSiteKey: req.body.recaptchaSiteKey || '',
    recaptchaSecretKey: req.body.recaptchaSecretKey || '',
    enableRecaptchaProductEnquiry: req.body.enableRecaptchaProductEnquiry !== undefined ? req.body.enableRecaptchaProductEnquiry : true,
    enableRecaptchaJobApply: req.body.enableRecaptchaJobApply !== undefined ? req.body.enableRecaptchaJobApply : true,
    enableRecaptchaContact: req.body.enableRecaptchaContact !== undefined ? req.body.enableRecaptchaContact : true,
    enableEmailContact: req.body.enableEmailContact !== undefined ? req.body.enableEmailContact : true,
    enableEmailProductEnquiry: req.body.enableEmailProductEnquiry !== undefined ? req.body.enableEmailProductEnquiry : true,
    enableEmailJobApplication: req.body.enableEmailJobApplication !== undefined ? req.body.enableEmailJobApplication : true,
    enableEmailDynamicForms: req.body.enableEmailDynamicForms !== undefined ? req.body.enableEmailDynamicForms : true,
    showLoginButton: req.body.showLoginButton !== undefined ? req.body.showLoginButton : true,
    showLoginToPublic: req.body.showLoginToPublic !== undefined ? req.body.showLoginToPublic : true,
    showRegistrationToPublic: req.body.showRegistrationToPublic !== undefined ? req.body.showRegistrationToPublic : true,
    mapUrl: req.body.mapUrl || '',
    mapLatitude: req.body.mapLatitude || '',
    mapLongitude: req.body.mapLongitude || '',
    showMap: req.body.showMap !== undefined ? req.body.showMap : true,
    enableSocialSharing: req.body.enableSocialSharing || false,
    facebookPageId: req.body.facebookPageId || '',
    facebookPageAccessToken: req.body.facebookPageAccessToken || '',
    twitterApiKey: req.body.twitterApiKey || '',
    twitterApiSecret: req.body.twitterApiSecret || '',
    twitterAccessToken: req.body.twitterAccessToken || '',
    twitterAccessSecret: req.body.twitterAccessSecret || '',
    linkedinAccessToken: req.body.linkedinAccessToken || '',
    linkedinPersonUrn: req.body.linkedinPersonUrn || '',
    branding: req.body.branding || {},
    maintenanceMode: req.body.maintenanceMode !== undefined ? req.body.maintenanceMode : false,
    updatedAt: Date.now()
  };

  // Log email notification settings for debugging
  console.log('Email notification settings update:', {
    enableEmailContact: updateData.enableEmailContact,
    enableEmailProductEnquiry: updateData.enableEmailProductEnquiry,
    enableEmailJobApplication: updateData.enableEmailJobApplication,
    enableEmailDynamicForms: updateData.enableEmailDynamicForms
  });
  
  if (settings) {
    settings = await Settings.findByIdAndUpdate(
      settings._id,
      updateData,
      { new: true, runValidators: true }
    );
  } else {
    settings = await Settings.create(updateData);
  }
  
  res.json({ success: true, data: settings });
}));

module.exports = router;
