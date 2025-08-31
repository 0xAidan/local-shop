const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Customer information
  customer: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'Canada'
      }
    }
  },

  // Shop information
  shop: {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    location: {
      address: String,
      city: String,
      state: String,
      zipCode: String
    }
  },

  // Order items
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    productType: {
      type: String,
      enum: ['stock', 'unique', 'service'],
      default: 'stock'
    }
  }],

  // Order totals
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },

  // Delivery information
  delivery: {
    method: {
      type: String,
      enum: ['pickup', 'delivery', 'express'],
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    },
    instructions: String,
    estimatedTime: String,
    actualDeliveryTime: Date
  },

  // Order status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },

  // Payment information
  payment: {
    method: {
      type: String,
      enum: ['card', 'apple_pay', 'google_pay', 'paypal', 'cash'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'partially_refunded', 'failed'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },

  // Financial tracking
  financials: {
    platformFee: {
      type: Number,
      default: 0
    },
    netAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'CAD'
    }
  },

  // Return/refund information
  returnEligible: {
    type: Boolean,
    default: true
  },
  returnWindow: {
    type: Number,
    default: 30 // days
  },
  returnDeadline: {
    type: Date
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  statusUpdatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
orderSchema.index({ shop: 1, status: 1, createdAt: -1 });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

// Pre-save middleware to calculate return deadline
orderSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('createdAt')) {
    this.returnDeadline = new Date(this.createdAt.getTime() + (this.returnWindow * 24 * 60 * 60 * 1000));
  }
  this.updatedAt = new Date();
  next();
});

// Method to update order status
orderSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  this.statusUpdatedAt = new Date();
  return this.save();
};

// Method to calculate if order is return eligible
orderSchema.methods.isReturnEligible = function() {
  if (!this.returnEligible) return false;
  const now = new Date();
  return now <= this.returnDeadline;
};

// Static method to get orders by shop
orderSchema.statics.findByShop = function(shopId, options = {}) {
  const query = { 'shop.shopId': shopId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.dateRange) {
    query.createdAt = {
      $gte: options.dateRange.start,
      $lte: options.dateRange.end
    };
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .populate('customer.userId', 'firstName lastName email')
    .populate('items.product', 'name images category');
};

// Static method to get orders by customer
orderSchema.statics.findByCustomer = function(userId) {
  return this.find({ 'customer.userId': userId })
    .sort({ createdAt: -1 })
    .populate('shop.shopId', 'name location category');
};

module.exports = mongoose.model('Order', orderSchema); 