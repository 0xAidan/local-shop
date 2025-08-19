const express = require('express');
const { body, validationResult } = require('express-validator');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const { authenticateToken, requireShopOwner, requireShopOwnership } = require('../middleware/auth');
const { geocodeAddress } = require('../utils/geocoding');

const router = express.Router();

// Get all shops (public)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      lat,
      lng,
      radius = 10, // miles
      sort = 'rating',
      order = 'desc'
    } = req.query;

    const query = { isActive: true };
    
    // Category filter
    if (category) {
      query.category = category;
    }
    
    // Search filter
    if (search) {
      query.$text = { $search: search };
    }
    
    // Location-based filter
    if (lat && lng) {
      const coordinates = [parseFloat(lng), parseFloat(lat)];
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          $maxDistance: radius * 1609.34 // Convert miles to meters
        }
      };
    }
    
    // Sorting
    let sortOption = {};
    switch (sort) {
      case 'rating':
        sortOption = { 'rating.average': order === 'desc' ? -1 : 1 };
        break;
      case 'distance':
        if (lat && lng) {
          // Distance sorting is handled by $near in the query
          sortOption = { 'rating.average': -1 }; // Fallback to rating
        } else {
          sortOption = { 'rating.average': -1 };
        }
        break;
      case 'name':
        sortOption = { name: order === 'desc' ? -1 : 1 };
        break;
      case 'created':
        sortOption = { createdAt: order === 'desc' ? -1 : 1 };
        break;
      default:
        sortOption = { 'rating.average': -1 };
    }
    
    const skip = (page - 1) * limit;
    
    const shops = await Shop.find(query)
      .populate('owner', 'firstName lastName username avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');
    
    const total = await Shop.countDocuments(query);
    
    res.json({
      success: true,
      data: shops,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching shops:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shops'
    });
  }
});

// Get shop by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id)
      .populate('owner', 'firstName lastName username avatar');
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }
    
    if (!shop.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Shop is not active'
      });
    }
    
    res.json({
      success: true,
      data: shop
    });
  } catch (error) {
    console.error('Error fetching shop:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shop'
    });
  }
});

// Create new shop (authenticated shop owner)
router.post('/', 
  authenticateToken,
  requireShopOwner,
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Shop name must be between 2 and 100 characters'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
    body('category').isIn(['Grocery', 'Restaurant', 'Bakery', 'Butcher', 'Fish Market', 'Farmers Market', 'Convenience Store', 'Specialty Food', 'Beverages', 'Other']).withMessage('Invalid category'),
    body('location.address').trim().notEmpty().withMessage('Address is required'),
    body('location.city').trim().notEmpty().withMessage('City is required'),
    body('location.state').trim().notEmpty().withMessage('State is required'),
    body('location.zipCode').trim().notEmpty().withMessage('ZIP code is required'),
    body('contact.phone').optional().trim(),
    body('contact.email').optional().isEmail().withMessage('Invalid email format'),
    body('contact.website').optional().isURL().withMessage('Invalid website URL'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('features').optional().isArray().withMessage('Features must be an array')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }
      
      const {
        name,
        description,
        category,
        location,
        contact,
        hours,
        tags,
        features
      } = req.body;
      
      // Geocode the address to get coordinates
      const coordinates = await geocodeAddress(
        `${location.address}, ${location.city}, ${location.state} ${location.zipCode}`
      );
      
      if (!coordinates) {
        return res.status(400).json({
          success: false,
          message: 'Could not geocode the provided address'
        });
      }
      
      const shopData = {
        name,
        description,
        category,
        location: {
          ...location,
          coordinates
        },
        contact,
        hours,
        tags,
        features,
        owner: req.user._id
      };
      
      const shop = new Shop(shopData);
      await shop.save();
      
      // Add shop to user's shops
      await req.user.addShop(shop._id);
      
      const populatedShop = await Shop.findById(shop._id)
        .populate('owner', 'firstName lastName username avatar');
      
      res.status(201).json({
        success: true,
        message: 'Shop created successfully',
        data: populatedShop
      });
    } catch (error) {
      console.error('Error creating shop:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating shop'
      });
    }
  }
);

// Update shop (shop owner only)
router.put('/:id',
  authenticateToken,
  requireShopOwnership,
  [
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Shop name must be between 2 and 100 characters'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
    body('category').optional().isIn(['Grocery', 'Restaurant', 'Bakery', 'Butcher', 'Fish Market', 'Farmers Market', 'Convenience Store', 'Specialty Food', 'Beverages', 'Other']).withMessage('Invalid category'),
    body('location.address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
    body('location.city').optional().trim().notEmpty().withMessage('City cannot be empty'),
    body('location.state').optional().trim().notEmpty().withMessage('State cannot be empty'),
    body('location.zipCode').optional().trim().notEmpty().withMessage('ZIP code cannot be empty'),
    body('contact.phone').optional().trim(),
    body('contact.email').optional().isEmail().withMessage('Invalid email format'),
    body('contact.website').optional().isURL().withMessage('Invalid website URL'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('features').optional().isArray().withMessage('Features must be an array')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }
      
      const shop = await Shop.findById(req.params.id);
      if (!shop) {
        return res.status(404).json({
          success: false,
          message: 'Shop not found'
        });
      }
      
      const updateData = { ...req.body };
      
      // If location is being updated, geocode the new address
      if (updateData.location && (
        updateData.location.address !== shop.location.address ||
        updateData.location.city !== shop.location.city ||
        updateData.location.state !== shop.location.state ||
        updateData.location.zipCode !== shop.location.zipCode
      )) {
        const coordinates = await geocodeAddress(
          `${updateData.location.address}, ${updateData.location.city}, ${updateData.location.state} ${updateData.location.zipCode}`
        );
        
        if (!coordinates) {
          return res.status(400).json({
            success: false,
            message: 'Could not geocode the provided address'
          });
        }
        
        updateData.location.coordinates = coordinates;
      }
      
      const updatedShop = await Shop.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate('owner', 'firstName lastName username avatar');
      
      res.json({
        success: true,
        message: 'Shop updated successfully',
        data: updatedShop
      });
    } catch (error) {
      console.error('Error updating shop:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating shop'
      });
    }
  }
);

// Delete shop (shop owner only)
router.delete('/:id',
  authenticateToken,
  requireShopOwnership,
  async (req, res) => {
    try {
      const shop = await Shop.findById(req.params.id);
      if (!shop) {
        return res.status(404).json({
          success: false,
          message: 'Shop not found'
        });
      }
      
      // Delete all products associated with this shop
      await Product.deleteMany({ shop: req.params.id });
      
      // Remove shop from user's shops
      await req.user.removeShop(req.params.id);
      
      // Delete the shop
      await Shop.findByIdAndDelete(req.params.id);
      
      res.json({
        success: true,
        message: 'Shop deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting shop:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting shop'
      });
    }
  }
);

// Get shop statistics (shop owner only)
router.get('/:id/stats',
  authenticateToken,
  requireShopOwnership,
  async (req, res) => {
    try {
      const shopId = req.params.id;
      
      const [productCount, availableProducts, totalRevenue, averageRating] = await Promise.all([
        Product.countDocuments({ shop: shopId }),
        Product.countDocuments({ shop: shopId, isAvailable: true }),
        // Add revenue calculation when orders are implemented
        Promise.resolve(0),
        Shop.findById(shopId).select('rating.average')
      ]);
      
      res.json({
        success: true,
        data: {
          totalProducts: productCount,
          availableProducts,
          totalRevenue,
          averageRating: averageRating?.rating?.average || 0,
          // Add more stats as needed
        }
      });
    } catch (error) {
      console.error('Error fetching shop stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching shop statistics'
      });
    }
  }
);

// Upload shop images (shop owner only)
router.post('/:id/images',
  authenticateToken,
  requireShopOwnership,
  async (req, res) => {
    try {
      // This will be implemented with multer and cloudinary
      // For now, just return a placeholder
      res.json({
        success: true,
        message: 'Image upload endpoint - to be implemented with multer'
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading images'
      });
    }
  }
);

module.exports = router; 