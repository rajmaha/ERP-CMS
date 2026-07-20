const mongoose = require('mongoose');

const HomeContentSchema = new mongoose.Schema({
  heroTitle: {
    type: String,
    required: true
  },
  heroSubtitle: String,
  heroImage: String,
  heroDescription: String,

  sectionTitles: {
    whyChooseUs: {
      type: String,
      default: 'Why Choose Us'
    },
    commitments: {
      type: String,
      default: 'Our Commitments'
    }
  },

  // Why Choose Us Section
  whyChooseUs: [{
    icon: String,
    title: String,
    description: String,
    order: Number,
    _id: false
  }],
  
  // Our Commitments Section
  commitments: [{
    number: String,
    title: String,
    description: String,
    order: Number,
    _id: false
  }],
  
  // Statistics Section
  statistics: [{
    number: String,
    label: String,
    order: Number,
    _id: false
  }],
  
  // CTA Section
  ctaTitle: String,
  ctaDescription: String,
  ctaButtonText: String,
  ctaButtonLink: String,
  
  // Additional Dynamic Sections
  sections: [{
    title: String,
    content: String,
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

module.exports = mongoose.model('HomeContent', HomeContentSchema);
