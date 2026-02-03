const mongoose = require('mongoose');

const FormSubmissionSchema = new mongoose.Schema({
  form: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DynamicForm',
    required: true
  },
  formTitle: String,
  responses: [{
    fieldId: String,
    label: String,
    value: mongoose.Schema.Types.Mixed
  }],
  ipAddress: String,
  userAgent: String,
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FormSubmission', FormSubmissionSchema);
