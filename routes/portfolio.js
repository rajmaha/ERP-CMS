const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorHandler = require('../middleware/errorHandler');

// @route   GET /api/portfolio
// @desc    Get all portfolio (public)
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const items = await Portfolio.find({ isActive: true }).sort({ createdAt: -1 });
  res.json({ success: true, data: items });
}));

// @route   GET /api/portfolio/admin
// @desc    Get all portfolio (admin)
// @access  Private/Admin
router.get('/admin', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const items = await Portfolio.find().sort({ createdAt: -1 });
  res.json({ success: true, data: items });
}));

// @route   GET /api/portfolio/:id
// @desc    Get single portfolio
// @access  Public
router.get('/:id', asyncHandler(async (req, res, next) => {
  const item = await Portfolio.findById(req.params.id);
  if (!item) {
    return next(new ErrorHandler('Portfolio not found', 404));
  }
  res.json({ success: true, data: item });
}));

// @route   POST /api/portfolio
// @desc    Create portfolio
// @access  Private/Admin
router.post('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const item = await Portfolio.create(req.body);
  res.status(201).json({ success: true, data: item });
}));

// @route   PUT /api/portfolio/:id
// @desc    Update portfolio
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const item = await Portfolio.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) {
    return next(new ErrorHandler('Portfolio not found', 404));
  }
  res.json({ success: true, data: item });
}));

// @route   DELETE /api/portfolio/:id
// @desc    Delete portfolio
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const item = await Portfolio.findById(req.params.id);
  if (!item) {
    return next(new ErrorHandler('Portfolio not found', 404));
  }
  await Portfolio.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

module.exports = router;
