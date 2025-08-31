const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Review type - either product or shop
  type: {
    type: String,
    enum: ['product', 'shop'],
    required: true
  },
  
  // Reference to the item being reviewed
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'itemModel'
  },
  
  // Dynamic reference to either Product or Shop model
  itemModel: {
    type: String,
    required: true,
    enum: ['Product', 'Shop']
  },
  
  // Shop that the review belongs to
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  
  // User who wrote the review
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Order that the review is based on (required for validation)
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  
  // Rating (1-5 stars)
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  
  // Written review content
  content: {
    type: String,
    trim: true,
    maxlength: [1000, 'Review content cannot exceed 1000 characters']
  },
  
  // Review status
  status: {
    type: String,
    enum: ['active', 'hidden', 'disputed', 'removed'],
    default: 'active'
  },
  
  // Whether the written review is visible (shop owner can toggle this)
  isContentVisible: {
    type: Boolean,
    default: true
  },
  
  // Dispute information (if review is disputed)
  dispute: {
    isDisputed: {
      type: Boolean,
      default: false
    },
    disputedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    disputedAt: Date,
    reason: {
      type: String,
      enum: [
        'inappropriate_content',
        'false_information',
        'spam',
        'harassment',
        'other'
      ]
    },
    description: String,
    adminDecision: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    adminNotes: String,
    resolvedAt: Date
  },
  
  // Helpful votes
  helpfulVotes: {
    count: {
      type: Number,
      default: 0
    },
    voters: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  
  // Images attached to review (optional)
  images: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Tags for categorization
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for performance
reviewSchema.index({ shop: 1, type: 1, status: 1 });
reviewSchema.index({ itemId: 1, type: 1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ order: 1 }, { unique: true }); // One review per order
reviewSchema.index({ 'dispute.isDisputed': 1, 'dispute.adminDecision': 1 });

// Compound index for shop ratings
reviewSchema.index({ shop: 1, status: 1, rating: 1 });

// Pre-save middleware to validate order status
reviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Order = mongoose.model('Order');
      const order = await Order.findById(this.order);
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Only allow reviews for completed orders
      if (order.status !== 'completed') {
        throw new Error('Reviews can only be submitted for completed orders');
      }
      
      // Check if review already exists for this order
      const existingReview = await mongoose.model('Review').findOne({ order: this.order });
      if (existingReview) {
        throw new Error('Review already exists for this order');
      }
      
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Method to toggle content visibility
reviewSchema.methods.toggleContentVisibility = function() {
  this.isContentVisible = !this.isContentVisible;
  return this.save();
};

// Method to dispute review
reviewSchema.methods.disputeReview = function(disputedBy, reason, description) {
  this.dispute = {
    isDisputed: true,
    disputedBy,
    disputedAt: new Date(),
    reason,
    description
  };
  this.status = 'disputed';
  return this.save();
};

// Method to resolve dispute
reviewSchema.methods.resolveDispute = function(decision, adminNotes) {
  this.dispute.adminDecision = decision;
  this.dispute.adminNotes = adminNotes;
  this.dispute.resolvedAt = new Date();
  
  if (decision === 'approved') {
    this.status = 'removed';
  } else if (decision === 'rejected') {
    this.status = 'active';
    this.dispute.isDisputed = false;
  }
  
  return this.save();
};

// Method to vote helpful
reviewSchema.methods.voteHelpful = function(userId) {
  if (!this.helpfulVotes.voters.includes(userId)) {
    this.helpfulVotes.voters.push(userId);
    this.helpfulVotes.count += 1;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove helpful vote
reviewSchema.methods.removeHelpfulVote = function(userId) {
  const voterIndex = this.helpfulVotes.voters.indexOf(userId);
  if (voterIndex > -1) {
    this.helpfulVotes.voters.splice(voterIndex, 1);
    this.helpfulVotes.count -= 1;
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to get reviews by shop
reviewSchema.statics.findByShop = function(shopId, options = {}) {
  const query = { shop: shopId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.type) {
    query.type = options.type;
  }
  
  if (options.rating) {
    query.rating = options.rating;
  }
  
  const sort = options.sort || { createdAt: -1 };
  const limit = options.limit || 20;
  const skip = options.skip || 0;
  
  return this.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('user', 'firstName lastName')
    .populate('itemId', 'name images')
    .populate('order', 'orderNumber');
};

// Static method to get review statistics for a shop
reviewSchema.statics.getShopStats = function(shopId) {
  return this.aggregate([
    {
      $match: {
        shop: mongoose.Types.ObjectId(shopId),
        status: 'active'
      }
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingCounts: {
          $push: '$rating'
        }
      }
    },
    {
      $project: {
        totalReviews: 1,
        averageRating: { $round: ['$averageRating', 1] },
        ratingDistribution: {
          '1': { $size: { $filter: { input: '$ratingCounts', cond: { $eq: ['$$this', 1] } } } },
          '2': { $size: { $filter: { input: '$ratingCounts', cond: { $eq: ['$$this', 2] } } } },
          '3': { $size: { $filter: { input: '$ratingCounts', cond: { $eq: ['$$this', 3] } } } },
          '4': { $size: { $filter: { input: '$ratingCounts', cond: { $eq: ['$$this', 4] } } } },
          '5': { $size: { $filter: { input: '$ratingCounts', cond: { $eq: ['$$this', 5] } } } }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Review', reviewSchema); 