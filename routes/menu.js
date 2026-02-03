const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorHandler = require('../middleware/errorHandler');

// @route   GET /api/menu
// @desc    Get all menu items (public) - hierarchical structure
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  await initializeDefaultMenuItems();
  const items = await MenuItem.find({ isActive: true }).sort({ order: 1 });
  
  // Build hierarchical structure
  const menuTree = buildMenuTree(items);
  
  res.json({ success: true, data: menuTree });
}));

// @route   GET /api/menu/flat
// @desc    Get all menu items (flat list for admin)
// @access  Private/Admin
router.get('/flat', protect, authorize('admin'), asyncHandler(async (req, res) => {
  await initializeDefaultMenuItems();
  const items = await MenuItem.find().sort({ level: 1, order: 1 });
  res.json({ success: true, data: items });
}));

// Helper function to build menu tree
const buildMenuTree = (items, parentId = null, level = 0) => {
  return items
    .filter(item => String(item.parentId) === String(parentId))
    .map(item => ({
      ...item.toObject(),
      children: buildMenuTree(items, item._id, level + 1)
    }));
};

// @route   GET /api/menu/admin
// @desc    Get all menu items (admin)
// @access  Private/Admin
router.get('/admin', protect, authorize('admin'), asyncHandler(async (req, res) => {
  await initializeDefaultMenuItems();
  const items = await MenuItem.find().sort({ order: 1 });
  res.json({ success: true, data: items });
}));

// @route   POST /api/menu
// @desc    Create menu item
// @access  Private/Admin
router.post('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const item = await MenuItem.create(req.body);
  res.status(201).json({ success: true, data: item });
}));

// @route   PUT /api/menu/:id
// @desc    Update menu item
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) {
    return next(new ErrorHandler('Menu item not found', 404));
  }
  res.json({ success: true, data: item });
}));

// @route   PUT /api/menu/reorder
// @desc    Reorder menu items
// @access  Private/Admin
router.put('/reorder', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { items } = req.body;
  const promises = items.map((item, index) => 
    MenuItem.findByIdAndUpdate(item._id, { order: index })
  );
  await Promise.all(promises);
  res.json({ success: true });
}));

// @route   DELETE /api/menu/:id
// @desc    Delete menu item
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) {
    return next(new ErrorHandler('Menu item not found', 404));
  }
  
  // Allow deletion of default items now
  await MenuItem.findByIdAndDelete(req.params.id);
  res.json({ success: true, data: {} });
}));

// Helper function to initialize default menu items
const initializeDefaultMenuItems = async () => {
  try {
    // Check if Careers menu exists
    const careersMenu = await MenuItem.findOne({ defaultKey: 'careers' });
    
    if (!careersMenu) {
      // Find the highest order number
      const lastItem = await MenuItem.findOne().sort({ order: -1 });
      const nextOrder = lastItem ? lastItem.order + 1 : 7;
      
      // Create Careers menu item
      await MenuItem.create({
        label: 'Careers',
        url: '/careers',
        order: nextOrder,
        isDefault: true,
        defaultKey: 'careers',
        isActive: true,
        level: 0,
        parentId: null
      });
      
      console.log('Careers menu item created');
    }
    
    // Initialize all default menus if none exist
    const count = await MenuItem.countDocuments();
    if (count === 0) {
      const defaultItems = [
        { label: 'Home', url: '/', order: 0, isDefault: true, defaultKey: 'home', isActive: true, level: 0 },
        { label: 'About', url: '/about', order: 1, isDefault: true, defaultKey: 'about', isActive: true, level: 0 },
        { label: 'Products', url: '/products', order: 2, isDefault: true, defaultKey: 'products', isActive: true, level: 0 },
        { label: 'Portfolio', url: '/portfolio', order: 3, isDefault: true, defaultKey: 'portfolio', isActive: true, level: 0 },
        { label: 'Testimonials', url: '/testimonials', order: 4, isDefault: true, defaultKey: 'testimonials', isActive: true, level: 0 },
        { label: 'Clients', url: '/clients', order: 5, isDefault: true, defaultKey: 'clients', isActive: true, level: 0 },
        { label: 'Gallery', url: '/gallery', order: 6, isDefault: true, defaultKey: 'gallery', isActive: true, level: 0 },
        { label: 'Careers', url: '/careers', order: 7, isDefault: true, defaultKey: 'careers', isActive: true, level: 0 },
        { label: 'Contact', url: '/contact', order: 8, isDefault: true, defaultKey: 'contact', isActive: true, level: 0 }
      ];
      await MenuItem.insertMany(defaultItems);
      console.log('All default menu items created');
    }
  } catch (err) {
    console.error('Error initializing menu items:', err);
  }
};

module.exports = router;
