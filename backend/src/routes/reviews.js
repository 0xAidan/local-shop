const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Order = require('../models/Order');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');
const mongoose = require('mongoose');

// Create a new review (customer only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { orderId, type, itemId, rating, content, tags, images } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!orderId || !type || !itemId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: orderId, type, itemId, and rating are required'
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Validate review type
    if (!['product', 'shop'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review type. Must be either "product" or "shop"'
      });
    }

    // Verify the order exists and belongs to the user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.customer.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only review orders that belong to you'
      });
    }

    // Verify the order is completed
    if (order.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted for completed orders'
      });
    }

    // Verify the item exists
    let item;
    if (type === 'product') {
      item = await Product.findById(itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
    } else {
      item = await Shop.findById(itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Shop not found'
        });
      }
    }

    // Check if review already exists for this order
    const existingReview = await Review.findOne({ order: orderId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this order'
      });
    }

    // Create the review
    const review = new Review({
      type,
      itemId,
      itemModel: type === 'product' ? 'Product' : 'Shop',
      shop: order.shop.shopId,
      user: userId,
      order: orderId,
      rating,
      content,
      tags,
      images
    });

    await review.save();

    // Update shop rating
    const shop = await Shop.findById(order.shop.shopId);
    if (shop) {
      await shop.updateRating(rating);
    }

    // If it's a product review, update product rating
    if (type === 'product') {
      const product = await Product.findById(itemId);
      if (product) {
        await product.updateAverageRating();
      }
    }

    // Populate the review for response
    await review.populate('user', 'firstName lastName');
    await review.populate('itemId', 'name images');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      error: error.message
    });
  }
});

// Get reviews for a shop (public endpoint)
router.get('/shop/:shopId', async (req, res) => {
  try {
    const { shopId } = req.params;
    const { type, rating, page = 1, limit = 20, sort = 'newest' } = req.query;

    // Validate shop exists
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Build query options
    const options = {
      status: 'active' // Only show active reviews
    };

    if (type) {
      options.type = type;
    }

    if (rating) {
      options.rating = parseInt(rating);
    }

    // Build sort options
    let sortOption;
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'highest':
        sortOption = { rating: -1, createdAt: -1 };
        break;
      case 'lowest':
        sortOption = { rating: 1, createdAt: -1 };
        break;
      case 'helpful':
        sortOption = { 'helpfulVotes.count': -1, createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;
    const reviews = await Review.findByShop(shopId, {
      ...options,
      sort: sortOption,
      limit: parseInt(limit),
      skip
    });

    // Get total count for pagination
    const totalReviews = await Review.countDocuments({
      shop: shopId,
      ...options
    });

    // Get review statistics
    const stats = await Review.getShopStats(shopId);
    const reviewStats = stats.length > 0 ? stats[0] : {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
    };

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / limit),
          totalReviews,
          hasNext: page * limit < totalReviews,
          hasPrev: page > 1
        },
        stats: reviewStats
      }
    });
  } catch (error) {
    console.error('Error fetching shop reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

// Get reviews for a specific product (public endpoint)
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 20, sort = 'newest' } = req.query;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Build sort options
    let sortOption;
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'highest':
        sortOption = { rating: -1, createdAt: -1 };
        break;
      case 'lowest':
        sortOption = { rating: 1, createdAt: -1 };
        break;
      case 'helpful':
        sortOption = { 'helpfulVotes.count': -1, createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;
    const reviews = await Review.find({
      itemId: productId,
      type: 'product',
      status: 'active'
    })
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('user', 'firstName lastName')
    .populate('order', 'orderNumber');

    // Get total count for pagination
    const totalReviews = await Review.countDocuments({
      itemId: productId,
      type: 'product',
      status: 'active'
    });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / limit),
          totalReviews,
          hasNext: page * limit < totalReviews,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

// Get user's reviews (authenticated user)
router.get('/my-reviews', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    const reviews = await Review.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('shop', 'name')
      .populate('itemId', 'name images')
      .populate('order', 'orderNumber');

    const totalReviews = await Review.countDocuments({ user: userId });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / limit),
          totalReviews,
          hasNext: page * limit < totalReviews,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

// Update review (review owner only)
router.patch('/:reviewId', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, content, tags, images } = req.body;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Verify the user owns this review
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own reviews'
      });
    }

    // Update fields
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }
      review.rating = rating;
    }

    if (content !== undefined) {
      review.content = content;
    }

    if (tags !== undefined) {
      review.tags = tags;
    }

    if (images !== undefined) {
      review.images = images;
    }

    await review.save();

    // Update shop rating if rating changed
    if (rating !== undefined) {
      const shop = await Shop.findById(review.shop);
      if (shop) {
        // Recalculate shop rating
        const shopReviews = await Review.find({ shop: review.shop, status: 'active' });
        const totalRating = shopReviews.reduce((sum, r) => sum + r.rating, 0);
        shop.rating.average = totalRating / shopReviews.length;
        shop.rating.count = shopReviews.length;
        await shop.save();
      }
    }

    // If it's a product review, update product rating
    if (review.type === 'product') {
      const product = await Product.findById(review.itemId);
      if (product) {
        await product.updateAverageRating();
      }
    }

    await review.populate('user', 'firstName lastName');
    await review.populate('itemId', 'name images');

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review'
    });
  }
});

// Delete review (review owner only)
router.delete('/:reviewId', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Verify the user owns this review
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    await review.remove();

    // Update shop rating
    const shop = await Shop.findById(review.shop);
    if (shop) {
      const shopReviews = await Review.find({ shop: review.shop, status: 'active' });
      if (shopReviews.length > 0) {
        const totalRating = shopReviews.reduce((sum, r) => sum + r.rating, 0);
        shop.rating.average = totalRating / shopReviews.length;
        shop.rating.count = shopReviews.length;
      } else {
        shop.rating.average = 0;
        shop.rating.count = 0;
      }
      await shop.save();
    }

    // If it's a product review, update product rating
    if (review.type === 'product') {
      const product = await Product.findById(review.itemId);
      if (product) {
        await product.updateAverageRating();
      }
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
});

// Toggle review content visibility (shop owner only)
router.patch('/:reviewId/toggle-visibility', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Verify the user owns the shop
    const shop = await Shop.findById(review.shop);
    if (!shop || shop.owner.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage reviews for your own shops'
      });
    }

    await review.toggleContentVisibility();

    res.json({
      success: true,
      message: `Review content ${review.isContentVisible ? 'made visible' : 'hidden'}`,
      data: review
    });
  } catch (error) {
    console.error('Error toggling review visibility:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle review visibility'
    });
  }
});

// Dispute review (shop owner only)
router.post('/:reviewId/dispute', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason, description } = req.body;
    const userId = req.user._id;

    if (!reason || !description) {
      return res.status(400).json({
        success: false,
        message: 'Reason and description are required for dispute'
      });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Verify the user owns the shop
    const shop = await Shop.findById(review.shop);
    if (!shop || shop.owner.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only dispute reviews for your own shops'
      });
    }

    // Check if review is already disputed
    if (review.dispute.isDisputed) {
      return res.status(400).json({
        success: false,
        message: 'Review is already disputed'
      });
    }

    await review.disputeReview(userId, reason, description);

    res.json({
      success: true,
      message: 'Review disputed successfully',
      data: review
    });
  } catch (error) {
    console.error('Error disputing review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to dispute review'
    });
  }
});

// Vote helpful on review (authenticated user)
router.post('/:reviewId/helpful', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user already voted
    const hasVoted = review.helpfulVotes.voters.includes(userId);
    
    if (hasVoted) {
      await review.removeHelpfulVote(userId);
      res.json({
        success: true,
        message: 'Helpful vote removed',
        data: { helpfulVotes: review.helpfulVotes }
      });
    } else {
      await review.voteHelpful(userId);
      res.json({
        success: true,
        message: 'Helpful vote added',
        data: { helpfulVotes: review.helpfulVotes }
      });
    }
  } catch (error) {
    console.error('Error voting helpful:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to vote helpful'
    });
  }
});

// Get review statistics for a shop (shop owner only)
router.get('/shop/:shopId/stats', authenticateToken, async (req, res) => {
  try {
    const { shopId } = req.params;
    const userId = req.user._id;

    // Verify the user owns the shop
    const shop = await Shop.findById(shopId);
    if (!shop || shop.owner.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only view statistics for your own shops'
      });
    }

    const stats = await Review.getShopStats(shopId);
    const reviewStats = stats.length > 0 ? stats[0] : {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
    };

    // Get recent reviews
    const recentReviews = await Review.find({
      shop: shopId,
      status: 'active'
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'firstName lastName')
    .populate('itemId', 'name images');

    res.json({
      success: true,
      data: {
        stats: reviewStats,
        recentReviews
      }
    });
  } catch (error) {
    console.error('Error fetching review statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review statistics'
    });
  }
});

module.exports = router; 