const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD']
  },
  
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  
  subcategory: {
    type: String,
    trim: true
  },
  
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: [true, 'Shop is required']
  },
  
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    altText: String
  }],
  
  inventory: {
    quantity: {
      type: Number,
      default: 0,
      min: [0, 'Quantity cannot be negative']
    },
    unit: {
      type: String,
      default: 'piece',
      enum: ['piece', 'kg', 'lb', 'g', 'oz', 'liter', 'gallon', 'dozen', 'bunch']
    },
    lowStockThreshold: {
      type: Number,
      default: 5
    },
    isUnlimited: {
      type: Boolean,
      default: false
    }
  },
  
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  tags: [{
    type: String,
    trim: true
  }],
  
  attributes: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    value: {
      type: String,
      required: true,
      trim: true
    }
  }],
  
  dietary: {
    isGlutenFree: { type: Boolean, default: false },
    isVegan: { type: Boolean, default: false },
    isVegetarian: { type: Boolean, default: false },
    isOrganic: { type: Boolean, default: false },
    isHalal: { type: Boolean, default: false },
    isKosher: { type: Boolean, default: false },
    isDairyFree: { type: Boolean, default: false },
    isNutFree: { type: Boolean, default: false }
  },
  
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    sugar: Number,
    sodium: Number
  },
  
  preparation: {
    prepTime: Number, // in minutes
    cookTime: Number, // in minutes
    servingSize: String,
    instructions: String
  },
  
  allergens: [{
    type: String,
    enum: [
      'Milk',
      'Eggs',
      'Fish',
      'Shellfish',
      'Tree Nuts',
      'Peanuts',
      'Wheat',
      'Soybeans',
      'Sesame'
    ]
  }],
  
  origin: {
    country: String,
    region: String,
    isLocal: { type: Boolean, default: false }
  },
  
  expiry: {
    hasExpiry: { type: Boolean, default: false },
    shelfLife: Number, // in days
    bestBefore: Date
  },
  
  variants: [{
    name: String, // e.g., "Size", "Color", "Flavor"
    options: [{
      value: String, // e.g., "Small", "Red", "Vanilla"
      priceModifier: { type: Number, default: 0 },
      isAvailable: { type: Boolean, default: true }
    }]
  }],
  
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  reviewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ shop: 1, category: 1 });
productSchema.index({ shop: 1, isAvailable: 1 });
productSchema.index({ shop: 1, isFeatured: 1 });
productSchema.index({ 
  name: 'text', 
  description: 'text', 
  category: 'text',
  tags: 'text'
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.inventory.isUnlimited) return 'unlimited';
  if (this.inventory.quantity === 0) return 'out-of-stock';
  if (this.inventory.quantity <= this.inventory.lowStockThreshold) return 'low-stock';
  return 'in-stock';
});

// Method to update average rating
productSchema.methods.updateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.reviewCount = 0;
  } else {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = totalRating / this.reviews.length;
    this.reviewCount = this.reviews.length;
  }
  return this.save();
};

// Method to add review
productSchema.methods.addReview = function(userId, rating, comment) {
  this.reviews.push({ user: userId, rating, comment });
  return this.updateAverageRating();
};

// Pre-save middleware to ensure only one primary image
productSchema.pre('save', function(next) {
  if (this.images && this.images.length > 0) {
    const primaryImages = this.images.filter(img => img.isPrimary);
    if (primaryImages.length > 1) {
      // Keep only the first primary image
      let foundPrimary = false;
      this.images.forEach(img => {
        if (img.isPrimary && !foundPrimary) {
          foundPrimary = true;
        } else if (img.isPrimary) {
          img.isPrimary = false;
        }
      });
    }
  }
  next();
});

module.exports = mongoose.model('Product', productSchema); 