const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: String,
  type: {
    type: String,
    enum: ['photo', 'video'],
    required: true
  },
  // For photos
  image: String,
  
  // For videos
  videoType: {
    type: String,
    enum: ['youtube', 'facebook', 'vimeo', 'upload'],
    default: 'youtube'
  },
  videoUrl: String,
  videoId: String,
  thumbnail: String,
  
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GalleryCategory',
    required: true
  },
  tags: [String],
  
  order: {
    type: Number,
    default: 0
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
  
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

GallerySchema.index({ type: 1, isActive: 1 });
GallerySchema.index({ category: 1 });
GallerySchema.index({ isFeatured: -1, createdAt: -1 });

module.exports = mongoose.model('Gallery', GallerySchema);
