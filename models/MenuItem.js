const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  label: {
    type: String,
    required: [true, 'Menu label is required'],
    trim: true
  },
  url: {
    type: String,
    required: [true, 'URL is required']
  },
  order: {
    type: Number,
    default: 0
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    default: null
  },
  level: {
    type: Number,
    default: 0
  },
  isExternal: {
    type: Boolean,
    default: false
  },
  openInNewTab: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  defaultKey: {
    type: String,
    enum: ['home', 'about', 'products', 'portfolio', 'testimonials', 'clients', 'gallery', 'careers', 'contact', null],
    default: null
  },
  icon: String,
  description: String,
  isMegaMenu: {
    type: Boolean,
    default: false
  },
  megaMenuColumns: {
    type: Number,
    default: 3,
    min: 2,
    max: 4
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
