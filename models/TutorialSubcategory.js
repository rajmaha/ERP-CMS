const mongoose = require('mongoose');

const TutorialSubcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subcategory name is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    lowercase: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TutorialCategory',
    required: true
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

TutorialSubcategorySchema.index({ category: 1, isActive: 1 });
TutorialSubcategorySchema.index({ slug: 1 });

module.exports = mongoose.model('TutorialSubcategory', TutorialSubcategorySchema);
