const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body } = require('express-validator');
const User = require('../models/User');
const Settings = require('../models/Settings');
const { protect, authorize } = require('../middleware/auth');
const handleValidationErrors = require('../middleware/validation');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorHandler = require('../middleware/errorHandler');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');

// Set up multer for file uploading
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// Helper function to send email
async function sendEmail(mailOptions) {
  const settings = await Settings.findOne();
  
  const smtpConfig = {
    host: settings?.smtpHost || process.env.SMTP_HOST,
    port: parseInt(settings?.smtpPort || process.env.SMTP_PORT),
    secure: settings?.smtpSecure !== false && (parseInt(settings?.smtpPort || process.env.SMTP_PORT) === 465),
    auth: {
      user: settings?.smtpUser || process.env.SMTP_USER,
      pass: settings?.smtpPassword || process.env.SMTP_PASSWORD
    }
  };

  if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
    throw new Error('SMTP configuration is incomplete');
  }

  const transporter = nodemailer.createTransport(smtpConfig);
  mailOptions.from = mailOptions.from || settings?.fromEmail || process.env.FROM_EMAIL || 'noreply@example.com';
  
  return transporter.sendMail(mailOptions);
}

// @route   POST /api/auth/register
// @desc    Register user (public registration)
// @access  Public
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], handleValidationErrors, asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorHandler('User already exists', 400));
  }

  // Generate email verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');

  user = await User.create({ 
    name, 
    email, 
    password,
    role: 'user',
    isEmailVerified: false,
    emailVerificationToken: verificationTokenHash,
    emailVerificationExpire: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    isEnabled: true
  });

  // Send verification email
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;

  const mailOptions = {
    to: user.email,
    subject: 'Email Verification Required',
    html: `
      <h2>Welcome to ERP CMS!</h2>
      <p>Thank you for registering. Please verify your email to activate your account.</p>
      <a href="${verificationUrl}" style="display: inline-block; background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
        Verify Email
      </a>
      <p>Or copy this link: <a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not create this account, please ignore this email.</p>
    `
  };

  try {
    await sendEmail(mailOptions);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();
    return next(new ErrorHandler('Email could not be sent', 500));
  }
}));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], handleValidationErrors, asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new ErrorHandler('Invalid credentials', 401));
  }

  if (!user.isEnabled) {
    return next(new ErrorHandler('Your account has been disabled by administrator', 403));
  }

  if (!user.isEmailVerified) {
    return next(new ErrorHandler('Please verify your email before logging in', 403));
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorHandler('Invalid credentials', 401));
  }

  const token = generateToken(user._id);

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}));

// @route   POST /api/auth/verify-email/:token
// @desc    Verify user email
// @access  Public
router.post('/verify-email/:token', asyncHandler(async (req, res, next) => {
  const { token } = req.params;

  const verificationTokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: verificationTokenHash,
    emailVerificationExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorHandler('Invalid or expired verification token', 400));
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();

  const jwtToken = generateToken(user._id);

  res.json({
    success: true,
    message: 'Email verified successfully. You can now login.',
    token: jwtToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}));

// @route   POST /api/auth/resend-verification
// @desc    Resend email verification
// @access  Public
router.post('/resend-verification', [
  body('email').isEmail().withMessage('Please include a valid email')
], handleValidationErrors, asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  if (user.isEmailVerified) {
    return next(new ErrorHandler('Email is already verified', 400));
  }

  // Generate new verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');

  user.emailVerificationToken = verificationTokenHash;
  user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  await user.save();

  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;

  const mailOptions = {
    to: user.email,
    subject: 'Email Verification - Please Verify Your Email',
    html: `
      <h2>Email Verification</h2>
      <p>Please verify your email to activate your account.</p>
      <a href="${verificationUrl}" style="display: inline-block; background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
        Verify Email
      </a>
      <p>Or copy this link: <a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link will expire in 24 hours.</p>
    `
  };

  try {
    await sendEmail(mailOptions);

    res.json({ 
      success: true, 
      message: 'Verification email has been sent to your email address' 
    });
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();
    return next(new ErrorHandler('Email could not be sent', 500));
  }
}));



// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, upload.single('photo'), asyncHandler(async (req, res, next) => {
  const { name, address, phone } = req.body;
  
  const updateData = {};
  if (name) updateData.name = name;
  if (address) updateData.address = address;
  if (phone) updateData.phone = phone;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.json({ success: true, data: user });
}));

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', protect, asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');
  
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return next(new ErrorHandler('Current password is incorrect', 401));
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password changed successfully' });
}));

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please include a valid email')
], handleValidationErrors, asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler('User not found with this email', 404));
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  // Save reset token to user
  user.passwordResetToken = resetTokenHash;
  user.passwordResetExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save();

  // Send email
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

  const mailOptions = {
    to: user.email,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
        Reset Password
      </a>
      <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 30 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `
  };

  try {
    await sendEmail(mailOptions);

    res.json({ 
      success: true, 
      message: 'Password reset link has been sent to your email' 
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();
    return next(new ErrorHandler('Email could not be sent', 500));
  }
}));

// @route   POST /api/auth/reset-password/:token
// @desc    Reset user password with token
// @access  Public
router.post('/reset-password/:token', [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], handleValidationErrors, asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  // Hash token to compare with database
  const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: resetTokenHash,
    passwordResetExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorHandler('Invalid or expired reset token', 400));
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();

  const jwtToken = generateToken(user._id);

  res.json({
    success: true,
    message: 'Password has been reset successfully',
    token: jwtToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}));

// @route   GET /api/auth/users
// @desc    Get all users (admin only)
// @access  Private
router.get('/users', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, data: users });
}));

// @route   GET /api/auth/users/:id
// @desc    Get user by ID (admin only)
// @access  Private
router.get('/users/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }
  res.json({ success: true, data: user });
}));

// @route   POST /api/auth/users
// @desc    Create new user (admin only)
// @access  Private
router.post('/users', protect, authorize('admin'), [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin')
], handleValidationErrors, asyncHandler(async (req, res, next) => {
  const { name, email, password, role = 'user' } = req.body;

  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorHandler('User already exists', 400));
  }

  user = await User.create({ name, email, password, role });

  res.status(201).json({
    success: true,
    data: user
  });
}));

// @route   PUT /api/auth/users/:id
// @desc    Update user (admin only)
// @access  Private
router.put('/users/:id', protect, authorize('admin'), [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please include a valid email'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin'),
  body('phone').optional(),
  body('address').optional(),
  body('isEnabled').optional().isBoolean().withMessage('isEnabled must be a boolean')
], handleValidationErrors, asyncHandler(async (req, res, next) => {
  const { name, email, role, phone, address, password, isEnabled } = req.body;

  let user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  // Check if email is being changed and if new email already exists
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorHandler('Email already in use', 400));
    }
    user.email = email;
  }

  if (name) user.name = name;
  if (role) user.role = role;
  if (phone) user.phone = phone;
  if (address) user.address = address;
  if (password) user.password = password;
  if (typeof isEnabled === 'boolean') user.isEnabled = isEnabled;

  user = await user.save();

  res.json({ success: true, data: user });
}));

// @route   DELETE /api/auth/users/:id
// @desc    Delete user (admin only)
// @access  Private
router.delete('/users/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  res.json({ success: true, message: 'User deleted successfully' });
}));

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

module.exports = router;
