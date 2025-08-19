const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:19006', 'exp://localhost:19000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Local Shop API is running (Simple Mode)',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Mock data for testing
const mockShops = [
  {
    id: 1,
    name: 'Fresh Farm Market',
    rating: { average: 4.8, count: 15 },
    distance: '0.5 km',
    category: 'Produce',
    description: 'Fresh organic vegetables and fruits from local farms',
    location: {
      address: '123 Main St',
      coordinates: { latitude: 48.3809, longitude: -89.2477 },
      city: 'Thunder Bay',
      state: 'ON',
      zipCode: 'P7A 1A1'
    },
    owner: {
      id: 1,
      firstName: 'Sarah',
      lastName: 'Johnson',
      username: 'sarahjohnson',
      avatar: 'https://example.com/avatar1.jpg'
    }
  },
  {
    id: 2,
    name: 'Artisan Bakery',
    rating: { average: 4.9, count: 23 },
    distance: '1.2 km',
    category: 'Bakery',
    description: 'Handcrafted breads and pastries made fresh daily',
    location: {
      address: '456 Oak Ave',
      coordinates: { latitude: 48.3810, longitude: -89.2478 },
      city: 'Thunder Bay',
      state: 'ON',
      zipCode: 'P7A 2B2'
    },
    owner: {
      id: 2,
      firstName: 'Mike',
      lastName: 'Chen',
      username: 'mikechen',
      avatar: 'https://example.com/avatar2.jpg'
    }
  }
];

const mockProducts = [
  {
    id: 1,
    name: 'Organic Tomatoes',
    price: 3.99,
    description: 'Fresh organic tomatoes from our greenhouse',
    category: 'Vegetables',
    shop: '1',
    inventory: {
      quantity: 50,
      unit: 'pieces',
      lowStockThreshold: 10,
      isUnlimited: false
    },
    isAvailable: true
  },
  {
    id: 2,
    name: 'Sourdough Bread',
    price: 5.99,
    description: 'Traditional sourdough bread made with local flour',
    category: 'Bread',
    shop: '2',
    inventory: {
      quantity: 20,
      unit: 'loaves',
      lowStockThreshold: 5,
      isUnlimited: false
    },
    isAvailable: true
  }
];

// API routes
app.get('/api/shops', (req, res) => {
  res.json({
    success: true,
    data: mockShops
  });
});

app.get('/api/shops/:id', (req, res) => {
  const shop = mockShops.find(s => s.id === parseInt(req.params.id));
  if (shop) {
    res.json({
      success: true,
      data: shop
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Shop not found'
    });
  }
});

app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    data: mockProducts
  });
});

app.get('/api/products/:id', (req, res) => {
  const product = mockProducts.find(p => p.id === parseInt(req.params.id));
  if (product) {
    res.json({
      success: true,
      data: product
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }
});

// Mock authentication
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple mock authentication
  if (email === 'customer@test.com' && password === 'password') {
    res.json({
      success: true,
      data: {
        user: {
          id: 1,
          username: 'testcustomer',
          email: 'customer@test.com',
          firstName: 'Test',
          lastName: 'Customer',
          role: 'customer'
        },
        token: 'mock-jwt-token-customer'
      }
    });
  } else if (email === 'owner@test.com' && password === 'password') {
    res.json({
      success: true,
      data: {
        user: {
          id: 2,
          username: 'testowner',
          email: 'owner@test.com',
          firstName: 'Test',
          lastName: 'Owner',
          role: 'shop_owner'
        },
        token: 'mock-jwt-token-owner'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { username, email, password, firstName, lastName, role } = req.body;
  
  res.json({
    success: true,
    data: {
      user: {
        id: Math.floor(Math.random() * 1000),
        username,
        email,
        firstName,
        lastName,
        role: role || 'customer'
      },
      token: 'mock-jwt-token-new-user'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Test credentials:`);
  console.log(`   Customer: customer@test.com / password`);
  console.log(`   Shop Owner: owner@test.com / password`);
});

module.exports = app; 