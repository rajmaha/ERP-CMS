const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Gallery = require('../models/Gallery');
const GalleryCategory = require('../models/GalleryCategory');
const { protect, authorize } = require('../middleware/auth');
const handleValidationErrors = require('../middleware/validation');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorHandler = require('../middleware/errorHandler');

// ===== CATEGORY ROUTES =====

// @route   GET /api/gallery/categories/list
// @desc    Get all gallery categories
// @access  Public
router.get('/categories/list', asyncHandler(async (req, res) => {
  const categories = await GalleryCategory.find({ isActive: true }).sort({ order: 1, name: 1 });
  res.json({ success: true, data: categories });
}));

// @route   GET /api/gallery/categories/admin
// @desc    Get all categories for admin
// @access  Private/Admin
router.get('/categories/admin', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const categories = await GalleryCategory.find().sort({ order: 1, name: 1 });
  res.json({ success: true, data: categories });
}));

// @route   POST /api/gallery/categories
// @desc    Create gallery category
// @access  Private/Admin
router.post('/categories', protect, authorize('admin'), [
  body('name').notEmpty().withMessage('Category name is required')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const category = await GalleryCategory.create(req.body);
  res.status(201).json({ success: true, data: category });
}));

// @route   PUT /api/gallery/categories/:id
// @desc    Update gallery category
// @access  Private/Admin
router.put('/categories/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const category = await GalleryCategory.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!category) {
    return next(new ErrorHandler('Category not found', 404));
  }
  
  res.json({ success: true, data: category });
}));

// @route   DELETE /api/gallery/categories/:id
// @desc    Delete gallery category
// @access  Private/Admin
router.delete('/categories/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const category = await GalleryCategory.findById(req.params.id);
  
  if (!category) {
    return next(new ErrorHandler('Category not found', 404));
  }

  // Check if category is used by any gallery items
  const itemCount = await Gallery.countDocuments({ category: req.params.id });
  if (itemCount > 0) {
    return next(new ErrorHandler(`Cannot delete category. It is used by ${itemCount} gallery item(s)`, 400));
  }

  await GalleryCategory.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

// ===== GALLERY ROUTES =====

// @route   GET /api/gallery
// @desc    Get all gallery items (public)
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const { type, category, featured, limit = 12, page = 1 } = req.query;
  
  let query = { isActive: true };
  
  if (type) query.type = type;
  if (category) query.category = category;
  if (featured) query.isFeatured = true;
  
  const skip = (page - 1) * limit;
  
  const items = await Gallery.find(query)
    .populate('category', 'name slug icon color')
    .sort({ order: 1, createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);
  
  const total = await Gallery.countDocuments(query);
  
  res.json({
    success: true,
    count: items.length,
    total,
    pages: Math.ceil(total / limit),
    data: items
  });
}));

// @route   GET /api/gallery/admin
// @desc    Get all gallery items (admin)
// @access  Private/Admin
router.get('/admin', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { type, category } = req.query;
  
  let query = {};
  if (type) query.type = type;
  if (category) query.category = category;
  
  const items = await Gallery.find(query)
    .populate('uploadedBy', 'name email')
    .populate('category', 'name slug icon color')
    .sort({ createdAt: -1 });
  
  res.json({ success: true, data: items });
}));

// @route   GET /api/gallery/:id
// @desc    Get single gallery item
// @access  Public
router.get('/:id', asyncHandler(async (req, res, next) => {
  const item = await Gallery.findById(req.params.id).populate('category', 'name slug icon color');
  
  if (!item) {
    return next(new ErrorHandler('Gallery item not found', 404));
  }
  
  // Increment views
  item.views += 1;
  await item.save();
  
  res.json({ success: true, data: item });
}));

// @route   POST /api/gallery
// @desc    Create gallery item
// @access  Private/Admin
router.post('/', protect, authorize('admin'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('type').isIn(['photo', 'video']).withMessage('Type must be photo or video'),
  body('category').notEmpty().withMessage('Category is required')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const itemData = {
    ...req.body,
    uploadedBy: req.user.id
  };
  
  const item = await Gallery.create(itemData);
  await item.populate('category', 'name slug icon color');
  
  res.status(201).json({ success: true, data: item });
}));

// @route   PUT /api/gallery/:id
// @desc    Update gallery item
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const item = await Gallery.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: Date.now() },
    { new: true, runValidators: true }
  ).populate('category', 'name slug icon color');
  
  if (!item) {
    return next(new ErrorHandler('Gallery item not found', 404));
  }
  
  res.json({ success: true, data: item });
}));

// @route   DELETE /api/gallery/:id
// @desc    Delete gallery item
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const item = await Gallery.findById(req.params.id);
  
  if (!item) {
    return next(new ErrorHandler('Gallery item not found', 404));
  }
  
  await Gallery.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

module.exports = router;
