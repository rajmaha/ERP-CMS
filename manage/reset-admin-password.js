require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function resetPassword() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    const admin = await User.findOne({ email: 'admin@example.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found. Creating new admin...');
      await User.create({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Admin user created');
    } else {
      admin.password = 'admin123';
      admin.role = 'admin';
      await admin.save();
      console.log('✅ Admin password reset');
    }

    console.log('\n📧 Email: admin@example.com');
    console.log('🔑 Password: admin123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetPassword();
