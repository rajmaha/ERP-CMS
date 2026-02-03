const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Page = require('../models/Page');
const HomeContent = require('../models/HomeContent');
const AboutContent = require('../models/AboutContent');
const { protect, authorize } = require('../middleware/auth');
const handleValidationErrors = require('../middleware/validation');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorHandler = require('../middleware/errorHandler');

// ===== HOME CONTENT ROUTES (MUST BE BEFORE /:idOrSlug) =====

// @route   GET /api/pages/home-content
// @desc    Get home content
// @access  Public
router.get('/home-content', asyncHandler(async (req, res) => {
  let content = await HomeContent.findOne();
  if (!content) {
    content = await HomeContent.create({
      heroTitle: 'Welcome to Our Site',
      heroSubtitle: 'Your success is our mission',
      heroImage: '',
      sections: []
    });
  }
  res.json({ success: true, data: content });
}));

// @route   POST /api/pages/home-content
// @desc    Update home content
// @access  Private/Admin
router.post('/home-content', protect, authorize('admin'), asyncHandler(async (req, res) => {
  let content = await HomeContent.findOne();
  
  if (content) {
    content = await HomeContent.findByIdAndUpdate(
      content._id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
  } else {
    content = await HomeContent.create(req.body);
  }
  
  res.json({ success: true, data: content });
}));

// ===== ABOUT CONTENT ROUTES =====

// @route   GET /api/pages/about-content
// @desc    Get about content
// @access  Public
router.get('/about-content', asyncHandler(async (req, res) => {
  let content = await AboutContent.findOne();
  if (!content) {
    content = await AboutContent.create({
      title: 'About Us',
      content: 'Learn more about our company',
      mission: '',
      vision: '',
      values: [],
      teamMembers: []
    });
  }
  res.json({ success: true, data: content });
}));

// @route   POST /api/pages/about-content
// @desc    Update about content
// @access  Private/Admin
router.post('/about-content', protect, authorize('admin'), asyncHandler(async (req, res) => {
  let content = await AboutContent.findOne();
  
  const updateData = {
    title: req.body.title,
    content: req.body.content,
    mission: req.body.mission,
    vision: req.body.vision,
    missionImage: req.body.missionImage,
    visionImage: req.body.visionImage,
    values: req.body.values || [],
    whyChooseUs: req.body.whyChooseUs || [],
    teamMembers: req.body.teamMembers || [],
    updatedAt: Date.now()
  };
  
  if (content) {
    content = await AboutContent.findByIdAndUpdate(
      content._id,
      updateData,
      { new: true, runValidators: true }
    );
  } else {
    content = await AboutContent.create(updateData);
  }
  
  res.json({ success: true, data: content });
}));

// ===== ADMIN ROUTES (MUST BE BEFORE /:idOrSlug) =====

// @route   GET /api/pages/admin
// @desc    Get all pages (admin)
// @access  Private/Admin
router.get('/admin', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  
  let query = {};
  if (status) query.status = status;
  if (search) query.$text = { $search: search };
  
  const pages = await Page.find(query)
    .populate('author', 'name email')
    .sort({ createdAt: -1 });
  
  res.json({ success: true, data: pages });
}));

// ===== PAGES CRUD ROUTES =====

// @route   GET /api/pages
// @desc    Get all pages (public)
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const { status, search, limit = 10, page = 1 } = req.query;
  
  let query = { status: 'published' };
  
  if (search) {
    query.$text = { $search: search };
  }
  
  const skip = (page - 1) * limit;
  
  const pages = await Page.find(query)
    .select('-content')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);
  
  const total = await Page.countDocuments(query);
  
  res.json({
    success: true,
    count: pages.length,
    total,
    pages: Math.ceil(total / limit),
    data: pages
  });
}));

// @route   POST /api/pages
// @desc    Create page
// @access  Private/Admin
router.post('/', protect, authorize('admin'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const pageData = {
    ...req.body,
    author: req.user.id
  };
  
  const page = await Page.create(pageData);
  res.status(201).json({ success: true, data: page });
}));

// @route   PUT /api/pages/:id
// @desc    Update page
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  // Ensure we're working with an ID
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new ErrorHandler('Invalid page ID', 400));
  }

  const page = await Page.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );
  
  if (!page) {
    return next(new ErrorHandler('Page not found', 404));
  }
  
  res.json({ success: true, data: page });
}));

// @route   DELETE /api/pages/:id
// @desc    Delete page
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  // Ensure we're working with an ID
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new ErrorHandler('Invalid page ID', 400));
  }

  const page = await Page.findById(req.params.id);
  
  if (!page) {
    return next(new ErrorHandler('Page not found', 404));
  }
  
  await Page.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

// @route   GET /api/pages/:idOrSlug
// @desc    Get page by ID or slug (MUST BE LAST)
// @access  Public
router.get('/:idOrSlug', asyncHandler(async (req, res, next) => {
  const { idOrSlug } = req.params;
  
  let page;
  
  // Check if it's a valid MongoDB ObjectId
  if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
    page = await Page.findById(idOrSlug).populate('author', 'name');
  } else {
    page = await Page.findOne({ slug: idOrSlug }).populate('author', 'name');
  }
  
  if (!page) {
    return next(new ErrorHandler('Page not found', 404));
  }
  
  // Increment views only for slug-based access (public)
  if (!idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
    page.views += 1;
    await page.save();
  }
  
  res.json({ success: true, data: page });
}));

module.exports = router;
