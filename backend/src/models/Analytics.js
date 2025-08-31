const mongoose = require('mongoose');

// Shop Analytics Schema
const shopAnalyticsSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  
  // Time period for this analytics record
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  
  date: {
    type: Date,
    required: true
  },
  
  // Sales metrics
  sales: {
    totalRevenue: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    totalItemsSold: { type: Number, default: 0 },
    returnsAmount: { type: Number, default: 0 },
    returnsCount: { type: Number, default: 0 }
  },
  
  // Customer metrics
  customers: {
    newCustomers: { type: Number, default: 0 },
    returningCustomers: { type: Number, default: 0 },
    totalUniqueCustomers: { type: Number, default: 0 }
  },
  
  // Product performance
  topProducts: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    unitsSold: Number,
    revenue: Number
  }],
  
  // Traffic metrics
  traffic: {
    shopViews: { type: Number, default: 0 },
    productViews: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }, // orders / views
    bounceRate: { type: Number, default: 0 }
  },
  
  // Financial metrics (CAD)
  financials: {
    grossRevenue: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 }, // 2.9% + $0.30 per transaction
    netRevenue: { type: Number, default: 0 },
    pendingPayouts: { type: Number, default: 0 },
    completedPayouts: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes for performance
shopAnalyticsSchema.index({ shop: 1, period: 1, date: 1 });
shopAnalyticsSchema.index({ date: -1 });

// User Analytics Schema (for customer insights)
const userAnalyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  date: {
    type: Date,
    required: true
  },
  
  // Shopping behavior
  behavior: {
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    favoriteCategories: [String],
    shopsVisited: { type: Number, default: 0 },
    returnsInitiated: { type: Number, default: 0 }
  },
  
  // Engagement metrics
  engagement: {
    appOpens: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 }, // in minutes
    searchesPerformed: { type: Number, default: 0 },
    reviewsWritten: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

userAnalyticsSchema.index({ user: 1, date: 1 });

module.exports = {
  ShopAnalytics: mongoose.model('ShopAnalytics', shopAnalyticsSchema),
  UserAnalytics: mongoose.model('UserAnalytics', userAnalyticsSchema)
};