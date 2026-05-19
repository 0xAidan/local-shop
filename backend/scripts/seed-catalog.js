/**
 * Safe catalog seed — does NOT delete users or existing data.
 * Skips if any shops already exist (use --force to add anyway).
 *
 * Usage:
 *   cd backend && node scripts/seed-catalog.js
 *   cd backend && node scripts/seed-catalog.js --force
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Shop = require('../src/models/Shop');
const Product = require('../src/models/Product');
const User = require('../src/models/User');

const OWNER_EMAIL = 'owner@test.com';
const OWNER_PASSWORD = 'password123';

const sampleShops = [
  {
    name: 'Fresh Farm Market',
    description: 'Fresh organic vegetables and fruits from local farms',
    category: 'Farmers Market',
    location: {
      address: '123 Main St',
      coordinates: { latitude: 48.3809, longitude: -89.2477 },
      city: 'Thunder Bay',
      province: 'ON',
      zipCode: 'P7A 1A1',
    },
    contact: {
      phone: '+1-807-555-0101',
      email: 'info@freshfarmmarket.com',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
        caption: 'Fresh produce',
        isPrimary: true,
      },
    ],
    rating: { average: 4.8, count: 15 },
    features: ['Organic', 'Local', 'Pickup'],
    isActive: true,
    isVerified: true,
  },
  {
    name: 'Artisan Bakery',
    description: 'Handcrafted breads and pastries made fresh daily',
    category: 'Bakery',
    location: {
      address: '456 Oak Ave',
      coordinates: { latitude: 48.381, longitude: -89.2478 },
      city: 'Thunder Bay',
      province: 'ON',
      zipCode: 'P7A 2B2',
    },
    contact: {
      phone: '+1-807-555-0102',
      email: 'hello@artisanbakery.com',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
        caption: 'Fresh bread',
        isPrimary: true,
      },
    ],
    rating: { average: 4.9, count: 23 },
    features: ['Local', 'Pickup', 'Delivery'],
    isActive: true,
    isVerified: true,
  },
];

const sampleProducts = [
  {
    name: 'Organic Tomatoes',
    description: 'Fresh organic tomatoes',
    price: 3.99,
    category: 'Vegetables',
    inventory: { quantity: 50, unit: 'piece', lowStockThreshold: 10, isUnlimited: false },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800',
        caption: 'Tomatoes',
        isPrimary: true,
      },
    ],
    productType: 'stock',
    averageRating: 4.5,
  },
  {
    name: 'Sourdough Bread',
    description: 'Traditional sourdough loaf',
    price: 5.99,
    category: 'Bread',
    inventory: { quantity: 20, unit: 'piece', lowStockThreshold: 5, isUnlimited: false },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
        caption: 'Sourdough',
        isPrimary: true,
      },
    ],
    productType: 'stock',
    averageRating: 4.8,
  },
  {
    name: 'Butter Croissant',
    description: 'Flaky butter croissant',
    price: 3.49,
    category: 'Pastry',
    inventory: { quantity: 30, unit: 'piece', lowStockThreshold: 5, isUnlimited: false },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800',
        caption: 'Croissant',
        isPrimary: true,
      },
    ],
    productType: 'stock',
    averageRating: 4.7,
  },
];

const run = async () => {
  const force = process.argv.includes('--force');

  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is required in backend/.env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const existingShops = await Shop.countDocuments();
  if (existingShops > 0 && !force) {
    console.log(`Skipping: ${existingShops} shop(s) already exist. Use --force to add more.`);
    await mongoose.disconnect();
    return;
  }

  let owner = await User.findOne({ email: OWNER_EMAIL });
  if (!owner) {
    owner = await User.create({
      username: 'testowner',
      email: OWNER_EMAIL,
      password: OWNER_PASSWORD,
      firstName: 'Test',
      lastName: 'Owner',
      role: 'shop_owner',
    });
    console.log(`Created shop owner: ${OWNER_EMAIL}`);
  } else if (owner.role !== 'shop_owner') {
    owner.role = 'shop_owner';
    await owner.save();
    console.log(`Updated ${OWNER_EMAIL} to shop_owner`);
  } else {
    console.log(`Using existing owner: ${OWNER_EMAIL}`);
  }

  const createdShops = await Shop.insertMany(
    sampleShops.map((shop) => ({ ...shop, owner: owner._id }))
  );
  console.log(`Created ${createdShops.length} shops`);

  for (let i = 0; i < sampleProducts.length; i += 1) {
    const shop = createdShops[i % createdShops.length];
    await Product.create({ ...sampleProducts[i], shop: shop._id });
  }
  console.log(`Created ${sampleProducts.length} products`);

  console.log('\nDemo shop owner login (mobile app — register as Shop Owner or use):');
  console.log(`  Email: ${OWNER_EMAIL}`);
  console.log(`  Password: ${OWNER_PASSWORD}`);
  console.log('\nVerify: GET /api/shops should list active shops.');

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
