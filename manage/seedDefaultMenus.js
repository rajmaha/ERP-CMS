const mongoose = require('mongoose');
require('dotenv').config();

const MenuItem = require('../models/MenuItem');

const defaultMenuItems = [
  {
    label: 'Home',
    url: '/',
    order: 0,
    parentId: null,
    level: 0,
    isExternal: false,
    openInNewTab: false,
    isActive: true,
    isDefault: true,
    defaultKey: 'home',
    icon: 'home'
  },
  {
    label: 'About',
    url: '/about',
    order: 1,
    parentId: null,
    level: 0,
    isExternal: false,
    openInNewTab: false,
    isActive: true,
    isDefault: true,
    defaultKey: 'about',
    icon: 'info'
  },
  {
    label: 'Products',
    url: '/products',
    order: 2,
    parentId: null,
    level: 0,
    isExternal: false,
    openInNewTab: false,
    isActive: true,
    isDefault: true,
    defaultKey: 'products',
    icon: 'shopping-bag'
  },
  {
    label: 'Portfolio',
    url: '/portfolio',
    order: 3,
    parentId: null,
    level: 0,
    isExternal: false,
    openInNewTab: false,
    isActive: true,
    isDefault: true,
    defaultKey: 'portfolio',
    icon: 'briefcase'
  },
  {
    label: 'Testimonials',
    url: '/testimonials',
    order: 4,
    parentId: null,
    level: 0,
    isExternal: false,
    openInNewTab: false,
    isActive: true,
    isDefault: true,
    defaultKey: 'testimonials',
    icon: 'star'
  },
  {
    label: 'Clients',
    url: '/clients',
    order: 5,
    parentId: null,
    level: 0,
    isExternal: false,
    openInNewTab: false,
    isActive: true,
    isDefault: true,
    defaultKey: 'clients',
    icon: 'users'
  },
  {
    label: 'Gallery',
    url: '/gallery',
    order: 6,
    parentId: null,
    level: 0,
    isExternal: false,
    openInNewTab: false,
    isActive: true,
    isDefault: true,
    defaultKey: 'gallery',
    icon: 'image'
  },
  {
    label: 'Careers',
    url: '/careers',
    order: 7,
    parentId: null,
    level: 0,
    isExternal: false,
    openInNewTab: false,
    isActive: true,
    isDefault: true,
    defaultKey: 'careers',
    icon: 'briefcase'
  },
  {
    label: 'Contact',
    url: '/contact',
    order: 8,
    parentId: null,
    level: 0,
    isExternal: false,
    openInNewTab: false,
    isActive: true,
    isDefault: true,
    defaultKey: 'contact',
    icon: 'mail'
  }
];

async function seedDefaultMenus() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erp-cms', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Check if default menus already exist
    const existingMenus = await MenuItem.countDocuments({ isDefault: true });
    
    if (existingMenus > 0) {
      console.log(`Default menus already exist (${existingMenus} items). Skipping seeding.`);
      console.log('\nTo reset and re-seed, run:');
      console.log('  MenuItem.deleteMany({ isDefault: true })');
      process.exit(0);
    }

    // Insert default menu items
    const result = await MenuItem.insertMany(defaultMenuItems);
    
    console.log(`\n✓ Successfully seeded ${result.length} default menu items:`);
    result.forEach(item => {
      console.log(`  - ${item.label} (${item.url})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding default menus:', error);
    process.exit(1);
  }
}

seedDefaultMenus();
