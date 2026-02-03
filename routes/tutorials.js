const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Tutorial = require('../models/Tutorial');
const TutorialCategory = require('../models/TutorialCategory');
const { protect, authorize } = require('../middleware/auth');
const handleValidationErrors = require('../middleware/validation');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorHandler = require('../middleware/errorHandler');
const slugify = require('slugify');

// ===== CATEGORY ROUTES =====

// @route   GET /api/tutorials/categories/tree
// @desc    Get all categories in tree structure
// @access  Public
router.get('/categories/tree', asyncHandler(async (req, res) => {
  const categories = await TutorialCategory.find({ isActive: true }).sort({ order: 1, name: 1 });
  
  // Build tree structure
  const buildTree = (items, parentId = null, level = 0) => {
    return items
      .filter(item => {
        if (parentId === null) return !item.parent;
        return item.parent && item.parent.toString() === parentId.toString();
      })
      .map(item => ({
        ...item.toObject(),
        children: buildTree(items, item._id, level + 1),
        level
      }));
  };
  
  const tree = buildTree(categories);
  res.json({ success: true, data: tree });
}));

// @route   GET /api/tutorials/categories/list
// @desc    Get all active tutorial categories (flat list)
// @access  Public
router.get('/categories/list', asyncHandler(async (req, res) => {
  const { parent } = req.query;
  let query = { isActive: true };
  if (parent) {
    query.parent = parent;
  }
  
  const categories = await TutorialCategory.find(query).sort({ order: 1, name: 1 });
  res.json({ success: true, data: categories });
}));

// @route   GET /api/tutorials/categories/admin/tree
// @desc    Get all categories in tree structure (admin)
// @access  Private/Admin
router.get('/categories/admin/tree', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const categories = await TutorialCategory.find()
    .populate('parent', '_id name')
    .sort({ order: 1, name: 1 });
  
  const buildTree = (items, parentId = null) => {
    return items
      .filter(item => {
        if (parentId === null) return !item.parent;
        const itemParentId = item.parent?._id || item.parent;
        return itemParentId && itemParentId.toString() === parentId.toString();
      })
      .map(item => ({
        ...item.toObject(),
        children: buildTree(items, item._id)
      }));
  };
  
  const tree = buildTree(categories);
  res.json({ success: true, data: tree });
}));

// @route   GET /api/tutorials/categories/admin
// @desc    Get all tutorial categories (admin - flat list)
// @access  Private/Admin
router.get('/categories/admin', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const categories = await TutorialCategory.find()
    .populate('parent', '_id name')
    .sort({ order: 1, name: 1 });
  res.json({ success: true, data: categories });
}));

// @route   POST /api/tutorials/categories
// @desc    Create tutorial category (with parent support for hierarchy)
// @access  Private/Admin
router.post('/categories', protect, authorize('admin'), [
  body('name').notEmpty().withMessage('Category name is required'),
  body('parent').optional().isString()
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { name, parent, description, icon, color, order } = req.body;
  
  let level = 0;
  let path = name;
  
  // If parent exists, get parent details
  if (parent) {
    const parentCategory = await TutorialCategory.findById(parent);
    if (!parentCategory) {
      return res.status(404).json({ success: false, message: 'Parent category not found' });
    }
    level = parentCategory.level + 1;
    path = `${parentCategory.path} > ${name}`;
  }
  
  const category = await TutorialCategory.create({
    name,
    slug: slugify(name, { lower: true }),
    parent: parent || null,
    level,
    path,
    description,
    icon,
    color,
    order
  });
  
  await category.populate('parent', 'name icon');
  res.status(201).json({ success: true, data: category });
}));

// @route   PUT /api/tutorials/categories/:id
// @desc    Update tutorial category
// @access  Private/Admin
router.put('/categories/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const updates = { ...req.body };
  if (req.body.name) {
    updates.slug = slugify(req.body.name, { lower: true });
  }
  
  const category = await TutorialCategory.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );
  
  if (!category) {
    return next(new ErrorHandler('Category not found', 404));
  }
  
  res.json({ success: true, data: category });
}));

// @route   DELETE /api/tutorials/categories/:id
// @desc    Delete tutorial category
// @access  Private/Admin
router.delete('/categories/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const category = await TutorialCategory.findById(req.params.id);
  
  if (!category) {
    return next(new ErrorHandler('Category not found', 404));
  }
  
  const tutorialCount = await Tutorial.countDocuments({ category: req.params.id });
  if (tutorialCount > 0) {
    return next(new ErrorHandler(`Cannot delete category. It is used by ${tutorialCount} tutorial(s)`, 400));
  }
  
  await TutorialCategory.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

// ===== TUTORIAL ROUTES =====

// @route   GET /api/tutorials
// @desc    Get all published tutorials (public)
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const { category, difficulty, featured, search, limit = 12, page = 1 } = req.query;
  
  let query = { status: 'published', isActive: true };
  
  if (category) query.category = category;
  if (difficulty) query.difficulty = difficulty;
  if (featured) query.isFeatured = true;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [search] } }
    ];
  }
  
  const skip = (page - 1) * limit;
  
  const tutorials = await Tutorial.find(query)
    .populate('category', 'name slug icon color')
    .populate('author', 'name email')
    .sort({ order: 1, createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);
  
  const total = await Tutorial.countDocuments(query);
  
  res.json({
    success: true,
    count: tutorials.length,
    total,
    pages: Math.ceil(total / limit),
    data: tutorials
  });
}));

// @route   GET /api/tutorials/admin
// @desc    Get all tutorials (admin)
// @access  Private/Admin
router.get('/admin', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { category, status, difficulty } = req.query;
  
  let query = {};
  if (category) query.category = category;
  if (status) query.status = status;
  if (difficulty) query.difficulty = difficulty;
  
  const tutorials = await Tutorial.find(query)
    .populate('category', 'name slug icon color')
    .populate('author', 'name email')
    .sort({ createdAt: -1 });
  
  res.json({ success: true, data: tutorials });
}));

// @route   GET /api/tutorials/by-slug/:slug
// @desc    Get tutorial by slug
// @access  Public
router.get('/by-slug/:slug', asyncHandler(async (req, res, next) => {
  const tutorial = await Tutorial.findOne({ slug: req.params.slug, status: 'published' })
    .populate('category', 'name slug icon color')
    .populate('author', 'name email')
    .populate('relatedTutorials', 'title slug difficulty');
  
  if (!tutorial) {
    return next(new ErrorHandler('Tutorial not found', 404));
  }
  
  // Increment views
  tutorial.views += 1;
  await tutorial.save();
  
  res.json({ success: true, data: tutorial });
}));

// @route   GET /api/tutorials/:id
// @desc    Get tutorial by ID
// @access  Public (published) / Admin (all)
router.get('/:id', asyncHandler(async (req, res, next) => {
  const tutorial = await Tutorial.findById(req.params.id)
    .populate('category', 'name slug icon color')
    .populate('author', 'name email')
    .populate('relatedTutorials', 'title slug difficulty');
  
  if (!tutorial) {
    return next(new ErrorHandler('Tutorial not found', 404));
  }
  
  // Check if user is admin or tutorial is published
  const token = req.headers.authorization?.split(' ')[1];
  let isAdmin = false;
  if (token) {
    try {
      const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
      isAdmin = decoded.role === 'admin';
    } catch (err) {
      // Token invalid, continue as public user
    }
  }
  
  if (!isAdmin && tutorial.status !== 'published') {
    return next(new ErrorHandler('Tutorial not found', 404));
  }
  
  // Increment views only for published tutorials
  if (tutorial.status === 'published') {
    tutorial.views += 1;
    await tutorial.save();
  }
  
  res.json({ success: true, data: tutorial });
}));

// @route   POST /api/tutorials
// @desc    Create tutorial
// @access  Private/Admin
router.post('/', protect, authorize('admin'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('difficulty').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty level')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { title, content, description, category, difficulty, duration, videoUrl, videoType, videoId, tags } = req.body;
  
  const tutorial = await Tutorial.create({
    title,
    slug: slugify(title, { lower: true }),
    content,
    description,
    category,
    difficulty,
    duration,
    videoUrl,
    videoType,
    videoId,
    tags: tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags) : [],
    author: req.user.id,
    status: 'draft'
  });
  
  await tutorial.populate('category', 'name slug icon color');
  await tutorial.populate('author', 'name email');
  
  res.status(201).json({ success: true, data: tutorial });
}));

// @route   PUT /api/tutorials/:id
// @desc    Update tutorial
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const updates = { ...req.body };
  
  if (req.body.title) {
    updates.slug = slugify(req.body.title, { lower: true });
  }
  
  if (req.body.tags && typeof req.body.tags === 'string') {
    updates.tags = req.body.tags.split(',').map(t => t.trim());
  }
  
  // Handle publish
  if (req.body.status === 'published' && !req.body.publishedAt) {
    updates.publishedAt = new Date();
  }
  
  updates.updatedAt = new Date();
  
  const tutorial = await Tutorial.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  ).populate('category', 'name slug icon color')
    .populate('author', 'name email');
  
  if (!tutorial) {
    return next(new ErrorHandler('Tutorial not found', 404));
  }
  
  res.json({ success: true, data: tutorial });
}));

// @route   DELETE /api/tutorials/:id
// @desc    Delete tutorial
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const tutorial = await Tutorial.findById(req.params.id);
  
  if (!tutorial) {
    return next(new ErrorHandler('Tutorial not found', 404));
  }
  
  await Tutorial.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

// @route   GET /api/tutorials/category/:categorySlug
// @desc    Get tutorials by category slug
// @access  Public
router.get('/category/:categorySlug', asyncHandler(async (req, res, next) => {
  const category = await TutorialCategory.findOne({ slug: req.params.categorySlug });
  
  if (!category) {
    return next(new ErrorHandler('Category not found', 404));
  }
  
  const tutorials = await Tutorial.find({ 
    category: category._id, 
    status: 'published', 
    isActive: true 
  })
    .populate('category', 'name slug icon color')
    .populate('author', 'name email')
    .sort({ order: 1, createdAt: -1 });
  
  res.json({ success: true, data: tutorials });
}));

module.exports = router;
