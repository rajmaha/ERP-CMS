const mongoose = require('mongoose');

const DynamicFormSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Form title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: String,
  featureImage: String,
  fields: [{
    fieldId: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'email', 'number', 'textarea', 'select', 'radio', 'checkbox', 'date', 'file', 'color', 'url', 'gender', 'country'],
      required: true
    },
    placeholder: String,
    required: {
      type: Boolean,
      default: false
    },
    options: [String], // For select, radio, checkbox
    order: {
      type: Number,
      default: 0
    },
    validation: {
      minLength: Number,        // For text, textarea
      maxLength: Number,        // For text, textarea
      min: Number,              // For number
      max: Number,              // For number
      minDate: Date,            // For date
      maxDate: Date,            // For date
      minSelect: Number,        // For checkbox
      maxSelect: Number,        // For checkbox
      pattern: String,          // Custom regex pattern
      errorMessage: String      // Custom error message
    }
  }],
  enableRecaptcha: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'closed'],
    default: 'draft'
  },
  submissionCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  notificationEmail: String,
  successMessage: {
    type: String,
    default: 'Thank you for your submission!'
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

module.exports = mongoose.model('DynamicForm', DynamicFormSchema);
