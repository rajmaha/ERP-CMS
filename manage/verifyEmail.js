#!/usr/bin/env node

/**
 * Script to verify user email by email address
 * Usage: node scripts/verifyEmail.js <email>
 * Example: node scripts/verifyEmail.js admin@example.com
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const verifyEmail = async (email) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erp-cms');
    console.log('✓ Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`✗ User with email "${email}" not found`);
      process.exit(1);
    }

    // Update user to verify email
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    console.log(`✓ Email verified for user: ${user.name} (${user.email})`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Enabled: ${user.isEnabled}`);

    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
};

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/verifyEmail.js <email>');
  console.error('Example: node scripts/verifyEmail.js rajmaha@gmail.com');
  process.exit(1);
}

verifyEmail(email);
