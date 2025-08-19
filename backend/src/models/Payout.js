const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Payout details
  amount: {
    type: Number,
    required: true,
    min: [10, 'Minimum payout is $10 CAD'] // Minimum payout threshold
  },
  
  currency: {
    type: String,
    default: 'CAD',
    enum: ['CAD']
  },
  
  // Platform fees deducted
  fees: {
    transactionFee: { type: Number, default: 0 }, // 2.9% + $0.30
    platformFee: { type: Number, default: 0 }, // Additional platform fee if any
    totalFees: { type: Number, default: 0 }
  },
  
  netAmount: {
    type: Number,
    required: true
  },
  
  // Banking information
  bankAccount: {
    accountType: {
      type: String,
      enum: ['checking', 'savings'],
      required: true
    },
    accountNumber: {
      type: String,
      required: true,
      // In production, this should be encrypted
    },
    routingNumber: {
      type: String,
      required: true
    },
    bankName: String,
    accountHolderName: {
      type: String,
      required: true
    }
  },
  
  // Payout status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  
  // Processing details
  processingDetails: {
    initiatedAt: Date,
    processedAt: Date,
    completedAt: Date,
    failureReason: String,
    transactionId: String, // External payment processor transaction ID
    processingFee: Number
  },
  
  // Related orders (for tracking)
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  
  // Period covered by this payout
  periodStart: Date,
  periodEnd: Date,
  
  // Tax information (for Canadian tax reporting)
  taxInfo: {
    taxYear: Number,
    gstHstCollected: Number,
    pstCollected: Number,
    businessNumber: String // Canadian Business Number
  },
  
  notes: String
}, {
  timestamps: true
});

// Indexes
payoutSchema.index({ shop: 1, status: 1 });
payoutSchema.index({ user: 1, createdAt: -1 });
payoutSchema.index({ status: 1, createdAt: -1 });

// Methods
payoutSchema.methods.calculateFees = function() {
  // Canadian payment processing fees (similar to Stripe Canada)
  const transactionFeeRate = 0.029; // 2.9%
  const fixedFee = 0.30; // $0.30 CAD
  
  this.fees.transactionFee = (this.amount * transactionFeeRate) + fixedFee;
  this.fees.totalFees = this.fees.transactionFee + (this.fees.platformFee || 0);
  this.netAmount = this.amount - this.fees.totalFees;
  
  return this.fees;
};

payoutSchema.methods.canProcess = function() {
  return this.status === 'pending' && this.netAmount >= 10;
};

// Pre-save middleware to calculate fees
payoutSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isNew) {
    this.calculateFees();
  }
  next();
});

module.exports = mongoose.model('Payout', payoutSchema);