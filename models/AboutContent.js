const mongoose = require('mongoose');

const AboutContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: String,
  mission: String,
  vision: String,
  missionImage: String,
  visionImage: String,
  values: [String],
  whyChooseUs: [{
    icon: String,
    title: String,
    description: String,
    order: Number,
    _id: false
  }],
  teamMembers: [{
    name: String,
    position: String,
    bio: String,
    image: String,
    order: Number,
    _id: false
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AboutContent', AboutContentSchema);
