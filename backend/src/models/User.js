const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  
  avatar: {
    url: String,
    publicId: String
  },
  
  phone: {
    type: String,
    trim: true
  },
  
  role: {
    type: String,
    enum: ['customer', 'shop_owner', 'admin'],
    default: 'customer'
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    dietary: {
      isVegetarian: { type: Boolean, default: false },
      isVegan: { type: Boolean, default: false },
      isGlutenFree: { type: Boolean, default: false },
      isHalal: { type: Boolean, default: false },
      isKosher: { type: Boolean, default: false }
    },
    radius: {
      type: Number,
      default: 10, // miles
      min: 1,
      max: 50
    }
  },
  
  shops: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop'
  }],
  
  favorites: [{
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  
  reviews: [{
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop'
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
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
  
  lastLogin: {
    type: Date
  },
  
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  emailVerificationToken: String,
  emailVerificationExpires: Date
}, {
  timestamps: true
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for isShopOwner
userSchema.virtual('isShopOwner').get(function() {
  return this.role === 'shop_owner' || this.shops.length > 0;
});

// Index for search functionality
userSchema.index({ 
  username: 'text', 
  firstName: 'text', 
  lastName: 'text',
  email: 'text'
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

// Method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return verificationToken;
};

// Method to add favorite shop
userSchema.methods.addFavorite = function(shopId) {
  if (!this.favorites.some(fav => fav.shop.toString() === shopId.toString())) {
    this.favorites.push({ shop: shopId });
  }
  return this.save();
};

// Method to remove favorite shop
userSchema.methods.removeFavorite = function(shopId) {
  this.favorites = this.favorites.filter(
    fav => fav.shop.toString() !== shopId.toString()
  );
  return this.save();
};

// Method to check if shop is favorited
userSchema.methods.isFavorite = function(shopId) {
  return this.favorites.some(fav => fav.shop.toString() === shopId.toString());
};

// Method to add shop to user's shops
userSchema.methods.addShop = function(shopId) {
  if (!this.shops.includes(shopId)) {
    this.shops.push(shopId);
    if (this.role === 'customer') {
      this.role = 'shop_owner';
    }
  }
  return this.save();
};

// Method to remove shop from user's shops
userSchema.methods.removeShop = function(shopId) {
  this.shops = this.shops.filter(shop => shop.toString() !== shopId.toString());
  if (this.shops.length === 0 && this.role === 'shop_owner') {
    this.role = 'customer';
  }
  return this.save();
};

// Don't include password in JSON responses
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpires;
  return userObject;
};

module.exports = mongoose.model('User', userSchema); 