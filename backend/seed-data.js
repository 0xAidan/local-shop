const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Shop = require('./src/models/Shop');
const Product = require('./src/models/Product');
const User = require('./src/models/User');

// Sample data
const sampleShops = [
  {
    name: 'Fresh Farm Market',
    description: 'Fresh organic vegetables and fruits from local farms',
    category: 'Farmers Market',
    location: {
      address: '123 Main St',
      coordinates: { latitude: 48.3809, longitude: -89.2477 },
      city: 'Thunder Bay',
      state: 'ON',
      zipCode: 'P7A 1A1'
    },
    contact: {
      phone: '+1-807-555-0101',
      email: 'info@freshfarmmarket.com',
      website: 'https://freshfarmmarket.com'
    },
    hours: {
      monday: { open: '08:00', close: '18:00' },
      tuesday: { open: '08:00', close: '18:00' },
      wednesday: { open: '08:00', close: '18:00' },
      thursday: { open: '08:00', close: '18:00' },
      friday: { open: '08:00', close: '18:00' },
      saturday: { open: '09:00', close: '17:00' },
      sunday: { open: '10:00', close: '16:00' }
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
        caption: 'Fresh produce display',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
        caption: 'Market entrance',
        isPrimary: false
      }
    ],
    rating: { average: 4.8, count: 15 },
    features: ['Organic', 'Local', 'Pickup']
  },
  {
    name: 'Artisan Bakery',
    description: 'Handcrafted breads and pastries made fresh daily',
    category: 'Bakery',
    location: {
      address: '456 Oak Ave',
      coordinates: { latitude: 48.3810, longitude: -89.2478 },
      city: 'Thunder Bay',
      state: 'ON',
      zipCode: 'P7A 2B2'
    },
    contact: {
      phone: '+1-807-555-0102',
      email: 'hello@artisanbakery.com',
      website: 'https://artisanbakery.com'
    },
    hours: {
      monday: { open: '06:00', close: '20:00' },
      tuesday: { open: '06:00', close: '20:00' },
      wednesday: { open: '06:00', close: '20:00' },
      thursday: { open: '06:00', close: '20:00' },
      friday: { open: '06:00', close: '20:00' },
      saturday: { open: '07:00', close: '18:00' },
      sunday: { open: '07:00', close: '16:00' }
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
        caption: 'Fresh bread display',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
        caption: 'Bakery interior',
        isPrimary: false
      }
    ],
    rating: { average: 4.9, count: 23 },
    features: ['Local', 'Pickup', 'Delivery']
  },
  {
    name: 'Local Crafts',
    description: 'Unique handmade jewelry and home decor',
    category: 'Specialty Food',
    location: {
      address: '789 Pine Rd',
      coordinates: { latitude: 48.3811, longitude: -89.2479 },
      city: 'Thunder Bay',
      state: 'ON',
      zipCode: 'P7A 3C3'
    },
    contact: {
      phone: '+1-807-555-0103',
      email: 'crafts@localcrafts.com',
      website: 'https://localcrafts.com'
    },
    hours: {
      monday: { open: '10:00', close: '18:00' },
      tuesday: { open: '10:00', close: '18:00' },
      wednesday: { open: '10:00', close: '18:00' },
      thursday: { open: '10:00', close: '18:00' },
      friday: { open: '10:00', close: '18:00' },
      saturday: { open: '10:00', close: '17:00' },
      sunday: { open: '12:00', close: '16:00' }
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
        caption: 'Handmade jewelry',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
        caption: 'Craft workshop',
        isPrimary: false
      }
    ],
    rating: { average: 4.7, count: 18 },
    features: ['Local', 'Pickup']
  }
];

const sampleProducts = [
  {
    name: 'Organic Tomatoes',
    description: 'Fresh organic tomatoes from our greenhouse',
    price: 3.99,
    category: 'Vegetables',
    inventory: {
      quantity: 50,
      unit: 'piece',
      lowStockThreshold: 10,
      isUnlimited: false
    },
    images: [{
      url: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800',
      caption: 'Fresh organic tomatoes',
      isPrimary: true,
      altText: 'Red organic tomatoes on display'
    }],
    dietary: {
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true
    },
    allergens: [],
    averageRating: 4.5
  },
  {
    name: 'Sourdough Bread',
    description: 'Traditional sourdough bread made with local flour',
    price: 5.99,
    category: 'Bread',
    inventory: {
      quantity: 20,
      unit: 'piece',
      lowStockThreshold: 5,
      isUnlimited: false
    },
    images: [{
      url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
      caption: 'Fresh sourdough bread',
      isPrimary: true,
      altText: 'Golden sourdough bread loaf'
    }],
    dietary: {
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false
    },
    allergens: ['Wheat'],
    averageRating: 4.8
  },
  {
    name: 'Handmade Necklace',
    description: 'Unique beaded necklace made with local materials',
    price: 25.00,
    category: 'Jewelry',
    inventory: {
      quantity: 5,
      unit: 'piece',
      lowStockThreshold: 2,
      isUnlimited: false
    },
    images: [{
      url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
      caption: 'Handmade beaded necklace',
      isPrimary: true,
      altText: 'Colorful handmade necklace'
    }],
    dietary: {
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true
    },
    allergens: [],
    averageRating: 4.6
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Shop.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create a test user first
    const testUser = await User.create({
      username: 'testowner',
      email: 'owner@test.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'Owner',
      role: 'shop_owner'
    });
    console.log('✅ Created test user');

    // Create shops with the owner
    const shopsWithOwner = sampleShops.map(shop => ({
      ...shop,
      owner: testUser._id
    }));

    const createdShops = await Shop.insertMany(shopsWithOwner);
    console.log(`✅ Created ${createdShops.length} shops`);

    // Create products and associate them with shops
    for (let i = 0; i < sampleProducts.length; i++) {
      const product = sampleProducts[i];
      const shop = createdShops[i % createdShops.length]; // Distribute products across shops
      
      await Product.create({
        ...product,
        shop: shop._id
      });
    }

    console.log(`✅ Created ${sampleProducts.length} products`);

    // Test the API
    const shopCount = await Shop.countDocuments();
    const productCount = await Product.countDocuments();
    const userCount = await User.countDocuments();
    
    console.log('\n📊 Database Summary:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Shops: ${shopCount}`);
    console.log(`   Products: ${productCount}`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('🔗 Test your API:');
    console.log('   GET http://localhost:3001/api/shops');
    console.log('   GET http://localhost:3001/api/products');
    console.log('\n👤 Test User:');
    console.log('   Email: owner@test.com');
    console.log('   Password: password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seed function
seedDatabase(); 