const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorHandler = require('../middleware/errorHandler');

// @route   GET /api/clients
// @desc    Get all clients (public)
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const clients = await Client.find({ isActive: true }).sort({ createdAt: -1 });
  res.json({ success: true, data: clients });
}));

// @route   GET /api/clients/admin
// @desc    Get all clients (admin)
// @access  Private/Admin
router.get('/admin', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const clients = await Client.find().sort({ createdAt: -1 });
  res.json({ success: true, data: clients });
}));

// @route   GET /api/clients/:id
// @desc    Get single client
// @access  Public
router.get('/:id', asyncHandler(async (req, res, next) => {
  const client = await Client.findById(req.params.id);
  if (!client) {
    return next(new ErrorHandler('Client not found', 404));
  }
  res.json({ success: true, data: client });
}));

// @route   POST /api/clients
// @desc    Create client
// @access  Private/Admin
router.post('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const client = await Client.create(req.body);
  res.status(201).json({ success: true, data: client });
}));

// @route   PUT /api/clients/:id
// @desc    Update client
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!client) {
    return next(new ErrorHandler('Client not found', 404));
  }
  res.json({ success: true, data: client });
}));

// @route   DELETE /api/clients/:id
// @desc    Delete client
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const client = await Client.findById(req.params.id);
  if (!client) {
    return next(new ErrorHandler('Client not found', 404));
  }
  await Client.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

module.exports = router;
