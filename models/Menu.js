const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    default: null
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem'
  }],
  isExternal: {
    type: Boolean,
    default: false
  },
  openInNewTab: {
    type: Boolean,
    default: false
  },
  cssClass: String,
  icon: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
