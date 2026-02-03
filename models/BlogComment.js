const mongoose = require('mongoose');

const BlogCommentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost',
    required: true
  },
  author: String,
  email: String,
  comment: {
    type: String,
    required: [true, 'Comment is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'spam'],
    default: 'pending'
  },
  moderationNote: String,
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogComment',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('BlogComment', BlogCommentSchema);
