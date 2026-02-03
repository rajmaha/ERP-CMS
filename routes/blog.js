const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');
const BlogCategory = require('../models/BlogCategory');
const BlogComment = require('../models/BlogComment');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorHandler = require('../middleware/errorHandler');
const { shareToSocialMedia } = require('../utils/socialShare');

// @route   GET /api/blog/posts
// @desc    Get all published posts (public)
// @access  Public
router.get('/posts', asyncHandler(async (req, res) => {
  const { category, tag, search, featured, limit = 10, page = 1 } = req.query;
  
  let query = { status: 'published' };
  
  if (category) query.category = category;
  if (tag) query.tags = tag;
  if (featured === 'true') query.isFeatured = true;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } }
    ];
  }
  
  const skip = (page - 1) * limit;
  
  const posts = await BlogPost.find(query)
    .populate('author', 'name')
    .populate('category', 'name slug color')
    .sort({ publishedAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);
  
  const total = await BlogPost.countDocuments(query);
  
  res.json({
    success: true,
    count: posts.length,
    total,
    pages: Math.ceil(total / limit),
    data: posts
  });
}));

// @route   GET /api/blog/posts/:slug
// @desc    Get single post by slug
// @access  Public
router.get('/posts/:slug', asyncHandler(async (req, res, next) => {
  const post = await BlogPost.findOne({ slug: req.params.slug, status: 'published' })
    .populate('author', 'name')
    .populate('category', 'name slug color');
  
  if (!post) {
    return next(new ErrorHandler('Post not found', 404));
  }
  
  // Increment views
  post.views += 1;
  await post.save();
  
  res.json({ success: true, data: post });
}));

// @route   GET /api/blog/admin/posts
// @desc    Get all posts (admin)
// @access  Private/Admin
router.get('/admin/posts', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { status } = req.query;
  
  let query = {};
  if (status) query.status = status;
  
  const posts = await BlogPost.find(query)
    .populate('author', 'name email')
    .populate('category', 'name')
    .sort({ createdAt: -1 });
  
  res.json({ success: true, data: posts });
}));

// @route   POST /api/blog
// @desc    Create blog post
// @access  Private/Admin
router.post('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const post = await BlogPost.create({
    ...req.body,
    author: req.user.id
  });

  // Auto-share if status is published
  if (post.status === 'published') {
    const description = post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 200);
    shareToSocialMedia('blog', {
      title: post.title,
      description: description,
      slug: post.slug,
      imageUrl: post.featuredImage
    }).catch(err => console.error('Social share error:', err));
  }

  res.status(201).json({ success: true, data: post });
}));

// @route   PUT /api/blog/:id
// @desc    Update blog post
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  let post = await BlogPost.findById(req.params.id);

  if (!post) {
    return next(new ErrorHandler('Post not found', 404));
  }

  const wasUnpublished = post.status !== 'published';

  post = await BlogPost.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Share if status changed to published
  if (wasUnpublished && post.status === 'published') {
    const description = post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 200);
    shareToSocialMedia('blog', {
      title: post.title,
      description: description,
      slug: post.slug,
      imageUrl: post.featuredImage
    }).catch(err => console.error('Social share error:', err));
  }

  res.json({ success: true, data: post });
}));

// @route   PUT /api/blog/posts/:id/moderate
// @desc    Moderate blog post (approve/reject)
// @access  Private/Admin
router.put('/posts/:id/moderate', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const { status, moderationNote } = req.body;
  
  const post = await BlogPost.findById(req.params.id);
  
  if (!post) {
    return next(new ErrorHandler('Post not found', 404));
  }
  
  post.status = status;
  post.moderationNote = moderationNote;
  
  if (status === 'published' && !post.publishedAt) {
    post.publishedAt = Date.now();
  }
  
  await post.save();
  
  res.json({ success: true, data: post });
}));

// @route   DELETE /api/blog/posts/:id
// @desc    Delete blog post
// @access  Private/Admin
router.delete('/posts/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const post = await BlogPost.findById(req.params.id);
  
  if (!post) {
    return next(new ErrorHandler('Post not found', 404));
  }
  
  await BlogPost.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

// Categories Routes
router.get('/categories', asyncHandler(async (req, res) => {
  const categories = await BlogCategory.find({ isActive: true });
  res.json({ success: true, data: categories });
}));

router.get('/categories/admin', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const categories = await BlogCategory.find().sort({ createdAt: -1 });
  res.json({ success: true, data: categories });
}));

router.post('/categories', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const category = await BlogCategory.create({
    ...req.body,
    slug: req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  });
  res.status(201).json({ success: true, data: category });
}));

router.put('/categories/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const category = await BlogCategory.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!category) {
    return next(new ErrorHandler('Category not found', 404));
  }
  
  res.json({ success: true, data: category });
}));

router.delete('/categories/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const category = await BlogCategory.findById(req.params.id);
  
  if (!category) {
    return next(new ErrorHandler('Category not found', 404));
  }
  
  await BlogCategory.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

// Comments Routes
router.get('/posts/:postId/comments', asyncHandler(async (req, res) => {
  const comments = await BlogComment.find({
    post: req.params.postId,
    status: 'approved',
    parentComment: null
  }).sort({ createdAt: -1 });
  
  res.json({ success: true, data: comments });
}));

router.post('/posts/:postId/comments', asyncHandler(async (req, res) => {
  const comment = await BlogComment.create({
    post: req.params.postId,
    ...req.body
  });
  
  res.status(201).json({ success: true, data: comment });
}));

router.get('/admin/comments', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { status } = req.query;
  
  let query = {};
  if (status) query.status = status;
  
  const comments = await BlogComment.find(query)
    .populate('post', 'title slug')
    .sort({ createdAt: -1 });
  
  res.json({ success: true, data: comments });
}));

router.put('/admin/comments/:id/moderate', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const { status, moderationNote } = req.body;
  
  const comment = await BlogComment.findByIdAndUpdate(
    req.params.id,
    { status, moderationNote },
    { new: true }
  );
  
  if (!comment) {
    return next(new ErrorHandler('Comment not found', 404));
  }
  
  res.json({ success: true, data: comment });
}));

router.delete('/admin/comments/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const comment = await BlogComment.findById(req.params.id);
  
  if (!comment) {
    return next(new ErrorHandler('Comment not found', 404));
  }
  
  await BlogComment.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

module.exports = router;
