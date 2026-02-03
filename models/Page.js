const mongoose = require('mongoose');

const PageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  excerpt: String,
  featuredImage: String,
  
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  
  // SEO Fields
  metaTitle: String,
  metaDescription: String,
  metaKeywords: String,
  
  // Open Graph
  ogTitle: String,
  ogDescription: String,
  ogImage: String,
  
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  views: {
    type: Number,
    default: 0
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

// Generate slug from title before saving
PageSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

PageSchema.index({ slug: 1 });
PageSchema.index({ status: 1 });
PageSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Page', PageSchema);
