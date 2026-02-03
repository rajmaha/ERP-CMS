const mongoose = require('mongoose');

const BlogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  excerpt: String,
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  featuredImage: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogCategory',
    required: true
  },
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'rejected'],
    default: 'draft'
  },
  moderationNote: String,
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  metaTitle: String,
  metaDescription: String,
  metaKeywords: String,
  
  // Open Graph Settings
  ogTitle: String,
  ogDescription: String,
  ogImage: String,
  ogType: {
    type: String,
    default: 'article'
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

module.exports = mongoose.model('BlogPost', BlogPostSchema);
