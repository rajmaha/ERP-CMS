const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body } = require('express-validator');
const Media = require('../models/Media');
const MediaGroup = require('../models/MediaGroup');
const { protect, authorize } = require('../middleware/auth');
const handleValidationErrors = require('../middleware/validation');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorHandler = require('../middleware/errorHandler');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|mp4|avi|mov/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, and documents are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter
});

// Create an alias for mediaUpload to match the route usage
const mediaUpload = upload;

// ===== GROUP ROUTES =====

// @route   GET /api/media/groups/list
// @desc    Get all media groups
// @access  Private/Admin
router.get('/groups/list', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const groups = await MediaGroup.find().sort('order');
  res.json({ success: true, data: groups });
}));

// @route   POST /api/media/groups
// @desc    Create media group
// @access  Private/Admin
router.post('/groups', protect, authorize('admin'),
  [
    body('name').notEmpty().withMessage('Group name is required')
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { name, description, icon, color } = req.body;
    
    const groupData = {
      name,
      description: description || '',
      icon: icon || '📁',
      color: color || '#667eea'
    };

    const group = await MediaGroup.create(groupData);
    res.status(201).json({ success: true, data: group });
  })
);

// @route   PUT /api/media/groups/:id
// @desc    Update media group
// @access  Private/Admin
router.put('/groups/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const { name, description, icon, color, order } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (description) updateData.description = description;
  if (icon) updateData.icon = icon;
  if (color) updateData.color = color;
  if (order !== undefined) updateData.order = order;

  const group = await MediaGroup.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!group) {
    return next(new ErrorHandler('Group not found', 404));
  }

  res.json({ success: true, data: group });
}));

// @route   DELETE /api/media/groups/:id
// @desc    Delete media group
// @access  Private/Admin
router.delete('/groups/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const group = await MediaGroup.findById(req.params.id);

  if (!group) {
    return next(new ErrorHandler('Group not found', 404));
  }

  // Unassign all media from this group
  await Media.updateMany({ group: req.params.id }, { group: null });

  await MediaGroup.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

// ===== MEDIA ROUTES =====

// @route   GET /api/media (must be BEFORE /api/media/admin)
// @desc    Get all media files (with filters)
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const { group, fileType, limit = 50, page = 1 } = req.query;
  
  let query = {};
  
  if (group && group !== 'null' && group !== '') {
    query.group = group;
  }
  
  if (fileType && fileType !== 'all') {
    query.fileType = fileType;
  }
  
  const skip = (page - 1) * limit;
  
  const media = await Media.find(query)
    .populate('group', 'name color icon')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);
  
  const total = await Media.countDocuments(query);
  
  res.json({
    success: true,
    count: media.length,
    total,
    data: media
  });
}));

// @route   GET /api/media/admin
// @desc    Get all media files for admin (no filters)
// @access  Private/Admin
router.get('/admin', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const media = await Media.find()
    .populate('group', 'name color icon')
    .sort({ createdAt: -1 });
  
  res.json({ 
    success: true, 
    count: media.length,
    data: media 
  });
}));

// @route   GET /api/media/:id
// @desc    Get media by ID
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const media = await Media.findById(req.params.id)
    .populate('uploadedBy', 'name email')
    .populate('group', 'name icon color');

  if (!media) {
    return next(new ErrorHandler('Media not found', 404));
  }

  res.json({ success: true, data: media });
}));

// @route   POST /api/media/upload
// @desc    Upload media file
// @access  Private/Admin
router.post('/upload', protect, authorize('admin'), mediaUpload.single('file'), asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorHandler('No file uploaded', 400));
  }

  const { description, tags: tagsStr, group } = req.body;
  const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()) : [];

  // Verify group exists if provided
  if (group) {
    const groupExists = await MediaGroup.findById(group);
    if (!groupExists) {
      return next(new ErrorHandler('Group not found', 404));
    }
  }

  // Determine file type
  const fileType = req.file.mimetype.startsWith('image')
    ? 'image'
    : req.file.mimetype.startsWith('video')
    ? 'video'
    : 'document';

  const mediaData = {
    filename: req.file.filename,
    originalName: req.file.originalname,
    url: `/uploads/${req.file.filename}`,
    fileType,
    mimeType: req.file.mimetype,
    size: req.file.size,
    description,
    tags,
    uploadedBy: req.user.id
  };

  if (group) {
    mediaData.group = group;
  }

  // Try to get image dimensions if it's an image
  if (fileType === 'image') {
    try {
      const sizeOf = require('image-size');
      const dimensions = sizeOf(req.file.path);
      mediaData.dimensions = {
        width: dimensions.width,
        height: dimensions.height
      };
    } catch (err) {
      console.warn('Could not determine image dimensions');
    }
  }

  const media = await Media.create(mediaData);
  await media.populate('group', 'name icon color');
  
  res.status(201).json({ success: true, data: media });
}));

// @route   PUT /api/media/:id
// @desc    Update media metadata
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const { description, tags: tagsStr, group } = req.body;

  let updateData = {};
  if (description) updateData.description = description;
  if (tagsStr) updateData.tags = tagsStr.split(',').map(t => t.trim());
  if (group !== undefined) updateData.group = group || null;

  const media = await Media.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('uploadedBy', 'name email')
   .populate('group', 'name icon color');

  if (!media) {
    return next(new ErrorHandler('Media not found', 404));
  }

  res.json({ success: true, data: media });
}));

// @route   DELETE /api/media/:id
// @desc    Delete media file
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const media = await Media.findById(req.params.id);

  if (!media) {
    return next(new ErrorHandler('Media not found', 404));
  }

  // Delete file from filesystem
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(__dirname, '../uploads', media.filename);
  
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error('Error deleting file:', err);
  }

  await Media.findByIdAndDelete(req.params.id);
  await Media.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));
module.exports = router;
// @route   GET /api/media/admin// @desc    Get all media files (admin)// @access  Private/Adminrouter.get('/admin', protect, authorize('admin'), asyncHandler(async (req, res) => {  const { group, fileType } = req.query;    let query = {};  if (group) query.group = group;  if (fileType) query.fileType = fileType;    const media = await Media.find(query).sort({ createdAt: -1 });  res.json({ success: true, data: media });}));module.exports = router;