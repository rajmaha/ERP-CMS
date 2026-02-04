#!/usr/bin/env node

/**
 * Script to change user role
 * Usage: node scripts/changeRole.js <email> <role>
 * Example: node scripts/changeRole.js admin@example.com admin
 * Roles: user, admin
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const changeRole = async (email, newRole) => {
  try {
    // Validate role
    const validRoles = ['user', 'admin'];
    if (!validRoles.includes(newRole)) {
      console.error(`✗ Invalid role. Must be one of: ${validRoles.join(', ')}`);
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erp-cms');
    console.log('✓ Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`✗ User with email "${email}" not found`);
      process.exit(1);
    }

    const oldRole = user.role;
    user.role = newRole;
    await user.save();

    console.log(`✓ Role updated successfully`);
    console.log(`  User: ${user.name} (${user.email})`);
    console.log(`  Old role: ${oldRole}`);
    console.log(`  New role: ${newRole}`);
    console.log(`  Email verified: ${user.isEmailVerified}`);
    console.log(`  Enabled: ${user.isEnabled}`);

    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
};

// Get email and role from command line arguments
const email = process.argv[2];
const role = process.argv[3];

if (!email || !role) {
  console.error('Usage: node scripts/changeRole.js <email> <role>');
  console.error('Example: node scripts/changeRole.js admin@example.com admin');
  console.error('Valid roles: user, admin');
  process.exit(1);
}

changeRole(email, role);
