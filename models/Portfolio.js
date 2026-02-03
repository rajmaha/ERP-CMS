const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  client: String,
  category: String,
  description: String,
  challenges: String,
  solutions: String,
  results: String,
  thumbnailImage: String,
  images: [String],
  projectUrl: String,
  completedDate: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);
