const express = require('express');
const { body, validationResult } = require('express-validator');
const Shop = require('../models/Shop');
const { authenticateToken, requireShopOwner } = require('../middleware/auth');
const { geocodeAddress, reverseGeocode } = require('../utils/geocoding');

const router = express.Router();

// Get all shops with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      lat,
      lng,
      radius = 50, // Default 50km radius
      sort = 'createdAt',
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

    // Location-based filtering
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusInMeters = radius * 1000; // Convert km to meters

      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radiusInMeters
        }
      };
    }

    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    const shops = await Shop.find(query)
      .populate('owner', 'firstName lastName username avatar')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Shop.countDocuments(query);

    res.json({
      success: true,
      data: shops,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching shops:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shops'
    });
  }
});

// Get shop by ID
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

    res.json({
      success: true,
      data: shop
    });
  } catch (error) {
    console.error('Error fetching shop:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shop'
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
    body('location.province').isIn(['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']).withMessage('Invalid province'),
    body('location.postalCode').matches(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/).withMessage('Invalid postal code format'),
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
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const {
        name,
        description,
        category,
        logo,
        location,
        contact,
        hours,
        tags,
        features,
        images
      } = req.body;

      // Geocode the address to get coordinates
      const fullAddress = `${location.address}, ${location.city}, ${location.province} ${location.postalCode}`;
      const coordinates = await geocodeAddress(fullAddress);

      if (!coordinates) {
        return res.status(400).json({
          success: false,
          message: 'Could not geocode the provided address. Please check the address and try again.'
        });
      }

      const shopData = {
        name,
        description,
        category,
        logo,
        location: {
          ...location,
          coordinates
        },
        contact,
        hours,
        tags,
        features,
        images,
        owner: req.user.id
      };

      const shop = new Shop(shopData);
      await shop.save();

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
        message: 'Failed to create shop'
      });
    }
  }
);

// Update shop
router.put('/:id', 
  authenticateToken,
  requireShopOwner,
  async (req, res) => {
    try {
      const shop = await Shop.findById(req.params.id);

      if (!shop) {
        return res.status(404).json({
          success: false,
          message: 'Shop not found'
        });
      }

      // Check if user owns this shop
      if (shop.owner.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this shop'
        });
      }

      const updatedShop = await Shop.findByIdAndUpdate(
        req.params.id,
        req.body,
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
        message: 'Failed to update shop'
      });
    }
  }
);

// Delete shop
router.delete('/:id', 
  authenticateToken,
  requireShopOwner,
  async (req, res) => {
    try {
      const shop = await Shop.findById(req.params.id);

      if (!shop) {
        return res.status(404).json({
          success: false,
          message: 'Shop not found'
        });
      }

      // Check if user owns this shop
      if (shop.owner.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this shop'
        });
      }

      await Shop.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'Shop deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting shop:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete shop'
      });
    }
  }
);

// Get shops by owner
router.get('/user/me', 
  authenticateToken,
  requireShopOwner,
  async (req, res) => {
    try {
      const shops = await Shop.find({ owner: req.user.id })
        .populate('owner', 'firstName lastName username avatar')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: shops
      });
    } catch (error) {
      console.error('Error fetching user shops:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user shops'
      });
    }
  }
);

module.exports = router; 