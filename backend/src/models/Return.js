const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  
  // Items being returned
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    originalPrice: {
      type: Number,
      required: true
    },
    refundAmount: {
      type: Number,
      required: true
    },
    condition: {
      type: String,
      enum: ['unopened', 'opened_unused', 'used', 'damaged'],
      required: true
    }
  }],
  
  // Return reason
  reason: {
    category: {
      type: String,
      enum: [
        'defective',
        'wrong_item',
        'not_as_described',
        'damaged_shipping',
        'changed_mind',
        'size_fit',
        'quality_issues',
        'other'
      ],
      required: true
    },
    description: {
      type: String,
      required: true,
      maxlength: 500
    }
  },
  
  // Return eligibility
  eligibility: {
    isEligible: {
      type: Boolean,
      default: true
    },
    eligibilityReason: String,
    returnWindow: {
      type: Number,
      default: 30 // days
    },
    purchaseDate: {
      type: Date,
      required: true
    }
  },
  
  // Financial details
  refund: {
    totalAmount: {
      type: Number,
      required: true
    },
    shippingRefund: {
      type: Number,
      default: 0
    },
    restockingFee: {
      type: Number,
      default: 0
    },
    processingFee: {
      type: Number,
      default: 0
    },
    netRefund: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'CAD'
    }
  },
  
  // Return status
  status: {
    type: String,
    enum: [
      'requested',
      'approved',
      'rejected',
      'return_shipped',
      'received',
      'inspected',
      'refund_processed',
      'completed',
      'cancelled'
    ],
    default: 'requested'
  },
  
  // Shipping information
  shipping: {
    returnLabel: {
      trackingNumber: String,
      carrier: String,
      cost: Number,
      paidBy: {
        type: String,
        enum: ['customer', 'shop', 'platform'],
        default: 'customer'
      }
    },
    returnAddress: {
      name: String,
      address: String,
      city: String,
      province: String,
      postalCode: String,
      country: { type: String, default: 'Canada' }
    }
  },
  
  // Communication
  messages: [{
    sender: {
      type: String,
      enum: ['customer', 'shop', 'admin'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    attachments: [String] // URLs to images/documents
  }],
  
  // Images for return request
  images: [{
    url: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Admin/Shop review
  review: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    decision: {
      type: String,
      enum: ['approved', 'rejected', 'partial']
    },
    notes: String,
    adjustedRefund: Number
  },
  
  // Important dates
  dates: {
    requestedAt: {
      type: Date,
      default: Date.now
    },
    approvedAt: Date,
    shippedAt: Date,
    receivedAt: Date,
    inspectedAt: Date,
    refundedAt: Date,
    completedAt: Date
  }
}, {
  timestamps: true
});

// Indexes
returnSchema.index({ order: 1 });
returnSchema.index({ user: 1, status: 1 });
returnSchema.index({ shop: 1, status: 1 });
returnSchema.index({ status: 1, createdAt: -1 });

// Virtual for return eligibility check
returnSchema.virtual('isWithinReturnWindow').get(function() {
  const daysSincePurchase = Math.floor((Date.now() - this.eligibility.purchaseDate) / (1000 * 60 * 60 * 24));
  return daysSincePurchase <= this.eligibility.returnWindow;
});

// Methods
returnSchema.methods.calculateRefund = function() {
  let total = 0;
  this.items.forEach(item => {
    total += item.refundAmount;
  });
  
  this.refund.totalAmount = total;
  this.refund.netRefund = total - (this.refund.restockingFee || 0) - (this.refund.processingFee || 0);
  
  return this.refund;
};

returnSchema.methods.canApprove = function() {
  return this.status === 'requested' && this.eligibility.isEligible && this.isWithinReturnWindow;
};

returnSchema.methods.addMessage = function(sender, message, attachments = []) {
  this.messages.push({
    sender,
    message,
    attachments,
    timestamp: new Date()
  });
  return this.save();
};

// Static methods
returnSchema.statics.getReturnPolicy = function(productType) {
  const policies = {
    'stock': {
      returnWindow: 30,
      restockingFee: 0,
      conditions: ['unopened', 'opened_unused']
    },
    'unique': {
      returnWindow: 7,
      restockingFee: 0.15, // 15% restocking fee for custom items
      conditions: ['unopened'],
      note: 'Custom and handmade items have limited return eligibility'
    },
    'service': {
      returnWindow: 0,
      restockingFee: 0,
      conditions: [],
      note: 'Services are generally non-refundable'
    }
  };
  
  return policies[productType] || policies['stock'];
};

module.exports = mongoose.model('Return', returnSchema);