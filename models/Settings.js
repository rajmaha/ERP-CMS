const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  // Site Information
  siteName: {
    type: String,
    default: 'ERP CMS'
  },
  siteDescription: String,
  logo: String,
  favicon: String,
  
  // Contact Information
  email: String,
  phone: String,
  address: String,
  
  // Social Media
  facebook: String,
  twitter: String,
  linkedin: String,
  instagram: String,
  youtube: String,
  
  // SEO Settings
  metaTitle: String,
  metaDescription: String,
  metaKeywords: String,
  googleAnalytics: String,
  
  // Open Graph Settings
  ogTitle: String,
  ogDescription: String,
  ogImage: String,
  ogType: {
    type: String,
    default: 'website'
  },
  
  // Analytics & Tracking
  googleTagManagerId: String,
  facebookPixelId: String,
  
  // Email Settings
  smtpHost: String,
  smtpPort: String,
  smtpUser: String,
  smtpPassword: String,
  smtpFromEmail: String,
  smtpFromName: String,
  smtpSecure: {
    type: Boolean,
    default: false
  },
  
  // Email Notification Settings
  enableEmailContact: {
    type: Boolean,
    default: true
  },
  enableEmailProductEnquiry: {
    type: Boolean,
    default: true
  },
  enableEmailJobApplication: {
    type: Boolean,
    default: true
  },
  enableEmailDynamicForms: {
    type: Boolean,
    default: true
  },
  
  // ReCAPTCHA
  recaptchaSiteKey: String,
  recaptchaSecretKey: String,
  enableRecaptchaProductEnquiry: {
    type: Boolean,
    default: true
  },
  enableRecaptchaJobApply: {
    type: Boolean,
    default: true
  },
  enableRecaptchaContact: {
    type: Boolean,
    default: true
  },
  
  // Display Settings
  showLoginButton: {
    type: Boolean,
    default: true
  },
  showLoginToPublic: {
    type: Boolean,
    default: true
  },
  showRegistrationToPublic: {
    type: Boolean,
    default: true
  },
  
  // Branding & Theme Settings
  branding: {
    primaryColor: {
      type: String,
      default: '#2563eb'
    },
    secondaryColor: {
      type: String,
      default: '#7c3aed'
    },
    accentColor: {
      type: String,
      default: '#f59e0b'
    },
    titleColor: {
      type: String,
      default: '#1f2937'
    },
    textColor: {
      type: String,
      default: '#4b5563'
    },
    lightTextColor: {
      type: String,
      default: '#6b7280'
    },
    sectionCaptionColor: {
      type: String,
      default: '#9ca3af'
    },
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    sectionBackgroundColor: {
      type: String,
      default: '#f9fafb'
    },
    borderColor: {
      type: String,
      default: '#e5e7eb'
    },
    linkColor: {
      type: String,
      default: '#2563eb'
    },
    linkHoverColor: {
      type: String,
      default: '#1d4ed8'
    },
    buttonPrimaryBg: {
      type: String,
      default: '#2563eb'
    },
    buttonPrimaryText: {
      type: String,
      default: '#ffffff'
    },
    buttonSecondaryBg: {
      type: String,
      default: '#f3f4f6'
    },
    buttonSecondaryText: {
      type: String,
      default: '#1f2937'
    },
    headerBgColor: {
      type: String,
      default: '#ffffff'
    },
    footerBgColor: {
      type: String,
      default: '#1f2937'
    },
    footerTextColor: {
      type: String,
      default: '#ffffff'
    }
  },
  
  // Map Settings
  mapUrl: {
    type: String,
    default: ''
  },
  mapLatitude: {
    type: String,
    default: ''
  },
  mapLongitude: {
    type: String,
    default: ''
  },
  showMap: {
    type: Boolean,
    default: true
  },
  
  // Social Media Auto-Share
  enableSocialSharing: {
    type: Boolean,
    default: false
  },
  
  // Maintenance Mode
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  
  // Facebook Settings
  facebookPageId: String,
  facebookPageAccessToken: String,
  
  // Twitter Settings
  twitterApiKey: String,
  twitterApiSecret: String,
  twitterAccessToken: String,
  twitterAccessSecret: String,
  
  // LinkedIn Settings
  linkedinAccessToken: String,
  linkedinPersonUrn: String,

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Settings', SettingsSchema);
