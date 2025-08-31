const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Shop name is required'],
    trim: true,
    maxlength: [100, 'Shop name cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Grocery',
      'Restaurant',
      'Bakery',
      'Butcher',
      'Fish Market',
      'Farmers Market',
      'Convenience Store',
      'Specialty Food',
      'Beverages',
      'Other'
    ]
  },

  logo: {
    url: {
      type: String,
      trim: true
    },
    publicId: {
      type: String,
      trim: true
    }
  },
  
  location: {
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    coordinates: {
      latitude: {
        type: Number,
        required: [true, 'Latitude is required']
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required']
      }
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    province: {
      type: String,
      required: [true, 'Province is required'],
      trim: true,
      enum: [
        'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'
      ]
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true,
      match: [/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, 'Please enter a valid Canadian postal code']
    }
  },
  
  contact: {
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    website: {
      type: String,
      trim: true
    }
  },
  
  hours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  
  images: [{
    url: String,
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Shop owner is required']
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Rating is now calculated from the Review model
  // This field is maintained for backward compatibility and performance
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  tags: [{
    type: String,
    trim: true
  }],
  
  features: [{
    type: String,
    enum: [
      'Delivery',
      'Pickup',
      'Curbside',
      'Organic',
      'Local',
      'Gluten-Free',
      'Vegan',
      'Halal',
      'Kosher',
      'Wheelchair Accessible',
      'Parking Available'
    ]
  }]
}, {
  timestamps: true
});

// Index for location-based queries
shopSchema.index({ 'location.coordinates': '2dsphere' });

// Index for search functionality
shopSchema.index({ 
  name: 'text', 
  description: 'text', 
  category: 'text',
  tags: 'text'
});

// Virtual for full address
shopSchema.virtual('fullAddress').get(function() {
  return `${this.location.address}, ${this.location.city}, ${this.location.province} ${this.location.postalCode}`;
});

// Method to update rating from Review model
shopSchema.methods.updateRating = async function(newRating) {
  try {
    const Review = mongoose.model('Review');
    const reviews = await Review.find({
      shop: this._id,
      status: 'active'
    });
    
    if (reviews.length === 0) {
      this.rating.average = 0;
      this.rating.count = 0;
    } else {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      this.rating.average = totalRating / reviews.length;
      this.rating.count = reviews.length;
    }
    return this.save();
  } catch (error) {
    console.error('Error updating shop rating:', error);
    return this;
  }
};

module.exports = mongoose.model('Shop', shopSchema); 