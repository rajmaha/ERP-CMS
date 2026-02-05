require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const User = require('../models/User');

const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const MONGODB_URI = process.env.MONGODB_URI;

const connectDb = async () => {
  if (!MONGODB_URI) {
    console.error('✗ MONGODB_URI not set in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connected to MongoDB');
  } catch (err) {
    console.error('✗ MongoDB connection error:', err.message || err);
    process.exit(1);
  }
};

const run = async () => {
  await connectDb();

  try {
    if (!ADMIN_EMAIL) {
      throw new Error('ADMIN_EMAIL is required');
    }
    // Normalize
    const email = ADMIN_EMAIL.toLowerCase().trim();
    const name = (ADMIN_NAME || '').toString().trim();
    const password = (ADMIN_PASSWORD || '').toString();

    if (!name) {
      throw new Error('Admin name is empty. Set ADMIN_NAME in .env or provide a default.');
    }
    if (!password || password.length < 6) {
      console.warn('⚠️ Using weak admin password. Consider setting ADMIN_PASSWORD in .env (min 6 chars).');
    }

    let user = await User.findOne({ email });

    if (user) {
      let changed = false;
      if (user.role !== 'admin') {
        user.role = 'admin';
        changed = true;
      }
      if (!user.name || user.name !== name) {
        user.name = name;
        changed = true;
      }
      if (changed) {
        await user.save();
        console.log(`✓ Updated existing user ${email} -> role: admin, name: ${name}`);
      } else {
        console.log(`✓ Admin user already exists: ${email}`);
      }
    } else {
      user = new User({
        name,
        email,
        password,
        role: 'admin'
      });

      await user.save();
      console.log(`✓ Created admin user: ${email}`);
      console.log(`   - name: ${name}`);
      console.log(`   - password: ${password}`);
      console.log('⚠️ Please change the password after first login in production.');
    }
    process.exit(0);
  } catch (err) {
    if (err.name === 'ValidationError' && err.errors) {
      console.error('Error seeding admin user: Validation failed');
      Object.values(err.errors).forEach(e => {
        console.error(` - ${e.path}: ${e.message}`);
      });
    } else {
      console.error('Error seeding admin user:', err.message || err);
    }
    process.exit(1);
  } finally {
    // Ensure mongoose connection closed if not already exiting
    try { await mongoose.connection.close(); } catch (e) { /* ignore */ }
  }
};

run();
