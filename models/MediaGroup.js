const mongoose = require('mongoose');

const MediaGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
    unique: true
  },
  description: String,
  icon: {
    type: String,
    default: '📁'
  },
  color: {
    type: String,
    default: '#667eea'
  },
  order: {
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

MediaGroupSchema.index({ order: 1 });

module.exports = mongoose.model('MediaGroup', MediaGroupSchema);
