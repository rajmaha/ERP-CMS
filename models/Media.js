const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['image', 'video', 'document', 'other'],
    default: 'other'
  },
  mimeType: String,
  size: Number,
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MediaGroup'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Media', MediaSchema);
