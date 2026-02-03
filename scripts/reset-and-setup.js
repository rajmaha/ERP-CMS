require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const HomeContent = require('../models/HomeContent');
const AboutContent = require('../models/AboutContent');

async function resetAndSetup() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. Ensure admin user exists
    console.log('1️⃣ Setting up admin user...');
    let admin = await User.findOne({ email: 'admin@example.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Admin user created');
      console.log('   Email: admin@example.com');
      console.log('   Password: admin123');
    } else {
      // Update existing admin password to admin123
      admin.password = 'admin123';
      admin.role = 'admin';
      await admin.save();
      console.log('✅ Admin user password reset to: admin123');
    }

    // 2. Setup home content
    console.log('\n2️⃣ Setting up home content...');
    let homeContent = await HomeContent.findOne();
    if (!homeContent) {
      homeContent = await HomeContent.create({
        heroTitle: 'Welcome to ERP CMS',
        heroSubtitle: 'Your Complete Business Management Solution',
        heroImage: '',
        sections: []
      });
      console.log('✅ Home content created');
    } else {
      console.log('✅ Home content already exists');
    }

    // 3. Setup about content
    console.log('\n3️⃣ Setting up about content...');
    let aboutContent = await AboutContent.findOne();
    if (!aboutContent) {
      aboutContent = await AboutContent.create({
        title: 'About Us',
        content: 'We are a leading company providing excellent services.',
        mission: 'To deliver quality solutions',
        vision: 'To be the best in our industry',
        values: ['Quality', 'Integrity', 'Innovation'],
        teamMembers: []
      });
      console.log('✅ About content created');
    } else {
      console.log('✅ About content already exists');
    }

    console.log('\n✅ Setup complete! You can now:');
    console.log('   1. Start the backend: npm run dev');
    console.log('   2. Start the frontend: cd client && npm start');
    console.log('   3. Login with: admin@example.com / admin123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetAndSetup();
