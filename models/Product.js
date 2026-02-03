const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  },
  category: String,
  shortDescription: String,
  description: String,
  thumbnailImage: String,
  images: [String],
  
  modules: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    image: String,
    features: [String],
    order: {
      type: Number,
      default: 0
    }
  }],
  
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  metaTitle: String,
  metaDescription: String,
  metaKeywords: String,
  ogTitle: String,
  ogDescription: String,
  ogImage: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', ProductSchema);
