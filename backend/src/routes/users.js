const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Shop = require('../models/Shop');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user profile (authenticated)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('shops', 'name category location rating')
      .populate('favorites.shop', 'name category location rating')
      .select('-password');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

// Update user profile
router.put('/profile',
  authenticateToken,
  [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name must be between 1 and 50 characters'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name must be between 1 and 50 characters'),
    body('phone')
      .optional()
      .trim()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage('Please provide a valid phone number'),
    body('location')
      .optional()
      .isObject()
      .withMessage('Location must be an object'),
    body('preferences')
      .optional()
      .isObject()
      .withMessage('Preferences must be an object')
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

      const allowedUpdates = [
        'firstName',
        'lastName',
        'phone',
        'location',
        'preferences'
      ];

      const updateData = {};
      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true, runValidators: true }
      ).populate('shops', 'name category location');

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating profile'
      });
    }
  }
);

// Add shop to favorites
router.post('/favorites/:shopId',
  authenticateToken,
  async (req, res) => {
    try {
      const shopId = req.params.shopId;
      
      // Check if shop exists
      const shop = await Shop.findById(shopId);
      if (!shop) {
        return res.status(404).json({
          success: false,
          message: 'Shop not found'
        });
      }

      await req.user.addFavorite(shopId);
      
      const updatedUser = await User.findById(req.user._id)
        .populate('favorites.shop', 'name category location rating');

      res.json({
        success: true,
        message: 'Shop added to favorites',
        data: updatedUser.favorites
      });
    } catch (error) {
      console.error('Error adding to favorites:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding to favorites'
      });
    }
  }
);

// Remove shop from favorites
router.delete('/favorites/:shopId',
  authenticateToken,
  async (req, res) => {
    try {
      const shopId = req.params.shopId;
      
      await req.user.removeFavorite(shopId);
      
      const updatedUser = await User.findById(req.user._id)
        .populate('favorites.shop', 'name category location rating');

      res.json({
        success: true,
        message: 'Shop removed from favorites',
        data: updatedUser.favorites
      });
    } catch (error) {
      console.error('Error removing from favorites:', error);
      res.status(500).json({
        success: false,
        message: 'Error removing from favorites'
      });
    }
  }
);

// Get user's favorite shops
router.get('/favorites',
  authenticateToken,
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id)
        .populate('favorites.shop', 'name category location rating images');

      res.json({
        success: true,
        data: user.favorites
      });
    } catch (error) {
      console.error('Error fetching favorites:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching favorites'
      });
    }
  }
);

// Get user's shops (for shop owners)
router.get('/shops',
  authenticateToken,
  async (req, res) => {
    try {
      if (req.user.role !== 'shop_owner' && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Shop owner role required.'
        });
      }

      const user = await User.findById(req.user._id)
        .populate('shops', 'name category location rating isActive');

      res.json({
        success: true,
        data: user.shops
      });
    } catch (error) {
      console.error('Error fetching user shops:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching shops'
      });
    }
  }
);

// Get user's reviews
router.get('/reviews',
  authenticateToken,
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id)
        .populate('reviews.shop', 'name category')
        .populate('reviews.product', 'name price');

      res.json({
        success: true,
        data: user.reviews
      });
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching reviews'
      });
    }
  }
);

// Delete user account
router.delete('/account',
  authenticateToken,
  [
    body('password')
      .notEmpty()
      .withMessage('Password is required to delete account')
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

      const { password } = req.body;

      // Verify password
      const user = await User.findById(req.user._id).select('+password');
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Incorrect password'
        });
      }

      // Delete user's shops and products (if any)
      if (user.shops.length > 0) {
        // This would require additional cleanup logic
        // For now, just delete the user
        console.log(`Deleting user with ${user.shops.length} shops`);
      }

      await User.findByIdAndDelete(req.user._id);

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting account'
      });
    }
  }
);

// Get user statistics
router.get('/stats',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user._id;
      
      const [favoriteCount, reviewCount, shopCount] = await Promise.all([
        User.findById(userId).then(user => user.favorites.length),
        User.findById(userId).then(user => user.reviews.length),
        User.findById(userId).then(user => user.shops.length)
      ]);

      res.json({
        success: true,
        data: {
          favoriteShops: favoriteCount,
          reviews: reviewCount,
          ownedShops: shopCount
        }
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user statistics'
      });
    }
  }
);

module.exports = router; 