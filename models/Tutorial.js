const mongoose = require('mongoose');

const TutorialSchema = new mongoose.Schema({
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
  description: String,
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  featuredImage: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TutorialCategory',
    required: true
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TutorialCategory'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  duration: Number, // in minutes
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
  },
  publishedAt: Date,
  
  // SEO
  metaTitle: String,
  metaDescription: String,
  metaKeywords: String,
  
  // Video
  videoUrl: String,
  videoType: {
    type: String,
    enum: ['youtube', 'vimeo', 'upload', 'none'],
    default: 'none'
  },
  videoId: String,
  
  // Code samples
  codeExamples: [{
    title: String,
    language: String,
    code: String
  }],
  
  // Related tutorials
  relatedTutorials: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutorial'
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

TutorialSchema.index({ slug: 1 });
TutorialSchema.index({ category: 1, isActive: 1, status: 1 });
TutorialSchema.index({ difficulty: 1, isActive: 1 });
TutorialSchema.index({ isFeatured: -1, createdAt: -1 });
TutorialSchema.index({ tags: 1 });

module.exports = mongoose.model('Tutorial', TutorialSchema);
