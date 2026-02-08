const express = require('express');
const router = express.Router();
const Demo = require('../models/Demo');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorHandler = require('../middleware/errorHandler');
const nodemailer = require('nodemailer');
const Settings = require('../models/Settings');

// @route   POST /api/demos
// @desc    Request a demo
// @access  Public
router.post('/', asyncHandler(async (req, res, next) => {
  const { product, productName, name, email, phone, company, preferredTime, preferredDate, message } = req.body;

  // Validate required fields
  if (!product || !name || !email || !phone) {
    return next(new ErrorHandler('Product, name, email, and phone are required', 400));
  }

  // Verify product exists
  const productExists = await Product.findById(product);
  if (!productExists) {
    return next(new ErrorHandler('Product not found', 404));
  }

  const demoData = {
    product,
    productName: productName || productExists.name,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    company: company || '',
    preferredTime: preferredTime || 'flexible',
    preferredDate: preferredDate || '',
    message: message || '',
    status: 'pending'
  };

  const demo = await Demo.create(demoData);

  // Send email notification to admin
  try {
    const settings = await Settings.findOne();
    if (settings && settings.enableEmailProductEnquiry && settings.smtp) {
      const transporter = nodemailer.createTransport({
        host: settings.smtp.host,
        port: parseInt(settings.smtp.port),
        secure: settings.smtp.secure || (settings.smtp.port == 465),
        auth: {
          user: settings.smtp.user,
          pass: settings.smtp.password
        }
      });

      const mailOptions = {
        from: settings.smtp.fromEmail || settings.smtp.user,
        to: settings.email,
        subject: `New Demo Request: ${productExists.name}`,
        html: `
          <h2>New Demo Request</h2>
          <p><strong>Product:</strong> ${productExists.name}</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Company:</strong> ${company || 'N/A'}</p>
          <p><strong>Preferred Time:</strong> ${preferredTime}</p>
          <p><strong>Preferred Date:</strong> ${preferredDate || 'Not specified'}</p>
          <p><strong>Message:</strong></p>
          <p>${message || 'No additional message'}</p>
          <hr />
          <p><a href="${process.env.ADMIN_URL || 'http://localhost:5000'}/admin/demos/${demo._id}">View Demo Request</a></p>
        `
      };

      await transporter.sendMail(mailOptions);
    }
  } catch (err) {
    console.error('Error sending demo request email:', err);
  }

  res.status(201).json({ 
    success: true,
    message: 'Demo request submitted successfully. We will contact you soon.',
    data: demo 
  });
}));

// @route   GET /api/demos
// @desc    Get all demos (admin only)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { status, product, search } = req.query;
  
  let query = {};
  
  if (status && status !== 'all') {
    query.status = status;
  }
  
  if (product && product !== 'all') {
    query.product = product;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { productName: { $regex: search, $options: 'i' } }
    ];
  }
  
  const demos = await Demo.find(query)
    .populate('product', 'name category')
    .sort({ createdAt: -1 });
  
  res.json({ 
    success: true,
    count: demos.length,
    data: demos 
  });
}));

// @route   GET /api/demos/:id
// @desc    Get demo by ID
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const demo = await Demo.findById(req.params.id).populate('product');
  
  if (!demo) {
    return next(new ErrorHandler('Demo request not found', 404));
  }
  
  res.json({ success: true, data: demo });
}));

// @route   PUT /api/demos/:id
// @desc    Update demo request (admin only)
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const { status, notes } = req.body;
  
  let demo = await Demo.findById(req.params.id);
  
  if (!demo) {
    return next(new ErrorHandler('Demo request not found', 404));
  }
  
  if (status) {
    demo.status = status;
  }
  
  if (notes) {
    demo.notes = notes;
  }
  
  demo.updatedAt = new Date();
  await demo.save();
  
  res.json({ 
    success: true,
    message: 'Demo request updated successfully',
    data: demo 
  });
}));

// @route   DELETE /api/demos/:id
// @desc    Delete demo request (admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const demo = await Demo.findByIdAndDelete(req.params.id);
  
  if (!demo) {
    return next(new ErrorHandler('Demo request not found', 404));
  }
  
  res.json({ 
    success: true,
    message: 'Demo request deleted successfully',
    data: {} 
  });
}));

module.exports = router;
