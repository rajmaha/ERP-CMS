const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');
const handleValidationErrors = require('../middleware/validation');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorHandler = require('../middleware/errorHandler');

// @route   GET /api/products
// @desc    Get all products (public)
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const { category, featured, search, limit = 12, page = 1 } = req.query;
  
  let query = { isActive: true };
  
  if (category) query.category = category;
  if (featured) query.isFeatured = true;
  if (search) query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { description: { $regex: search, $options: 'i' } }
  ];
  
  const skip = (page - 1) * limit;
  
  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);
  
  const total = await Product.countDocuments(query);
  
  res.json({
    success: true,
    count: products.length,
    total,
    pages: Math.ceil(total / limit),
    data: products
  });
}));

// @route   GET /api/products/admin
// @desc    Get all products (admin)
// @access  Private/Admin
router.get('/admin', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { status } = req.query;
  
  let query = {};
  if (status === 'active') query.isActive = true;
  if (status === 'inactive') query.isActive = false;
  
  const products = await Product.find(query).sort({ createdAt: -1 });
  
  res.json({ success: true, data: products });
}));

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }
  
  res.json({ success: true, data: product });
}));

// @route   POST /api/products
// @desc    Create product
// @access  Private/Admin
router.post('/', protect, authorize('admin'), [
  body('name').notEmpty().withMessage('Product name is required'),
  body('price').isNumeric().withMessage('Price must be a number')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
}));

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }
  
  res.json({ success: true, data: product });
}));

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }
  
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

module.exports = router;
