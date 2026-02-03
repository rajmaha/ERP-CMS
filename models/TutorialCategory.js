const mongoose = require('mongoose');

const TutorialCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    lowercase: true
  },
  description: String,
  icon: String,
  color: {
    type: String,
    default: '#3498db'
  },
  order: {
    type: Number,
    default: 0
  },
  // Parent category (null for root level)
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TutorialCategory',
    default: null
  },
  // Path for breadcrumb navigation (e.g., "root > Web Development > React")
  path: {
    type: String,
    default: ''
  },
  // Level in hierarchy (0 = root, 1 = subcategory, 2 = sub-subcategory, etc)
  level: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

TutorialCategorySchema.index({ slug: 1 });
TutorialCategorySchema.index({ isActive: 1 });
TutorialCategorySchema.index({ parent: 1 });
TutorialCategorySchema.index({ level: 1 });
TutorialCategorySchema.index({ path: 1 });

module.exports = mongoose.model('TutorialCategory', TutorialCategorySchema);
