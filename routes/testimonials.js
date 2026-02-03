const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorHandler = require('../middleware/errorHandler');

// @route   GET /api/testimonials
// @desc    Get all testimonials (public)
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({ isActive: true }).sort({ createdAt: -1 });
  res.json({ success: true, data: testimonials });
}));

// @route   GET /api/testimonials/admin
// @desc    Get all testimonials (admin)
// @access  Private/Admin
router.get('/admin', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find().sort({ createdAt: -1 });
  res.json({ success: true, data: testimonials });
}));

// @route   GET /api/testimonials/:id
// @desc    Get single testimonial
// @access  Public
router.get('/:id', asyncHandler(async (req, res, next) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) {
    return next(new ErrorHandler('Testimonial not found', 404));
  }
  res.json({ success: true, data: testimonial });
}));

// @route   POST /api/testimonials
// @desc    Create testimonial
// @access  Private/Admin
router.post('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.create(req.body);
  res.status(201).json({ success: true, data: testimonial });
}));

// @route   PUT /api/testimonials/:id
// @desc    Update testimonial
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!testimonial) {
    return next(new ErrorHandler('Testimonial not found', 404));
  }
  res.json({ success: true, data: testimonial });
}));

// @route   DELETE /api/testimonials/:id
// @desc    Delete testimonial
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) {
    return next(new ErrorHandler('Testimonial not found', 404));
  }
  await Testimonial.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

module.exports = router;
