const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Shop = require('../models/Shop');
const Order = require('../models/Order');
const Review = require('../models/Review');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.use(authenticateToken, requireAdmin);

router.get('/stats', async (req, res) => {
  try {
    const [users, shops, orders, revenueAgg] = await Promise.all([
      User.countDocuments(),
      Shop.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { 'payment.status': 'paid' } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        users,
        shops,
        orders,
        totalRevenue: revenueAgg[0]?.totalRevenue || 0,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to load stats' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 50, role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { email: new RegExp(search, 'i') },
        { username: new RegExp(search, 'i') },
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: { users, total, page: Number(page), limit: Number(limit) },
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ success: false, message: 'Failed to load users' });
  }
});

router.patch('/users/:userId', async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const updates = {};
    if (role) updates.role = role;
    if (typeof isActive === 'boolean') updates.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.userId, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
});

router.get('/shops', async (req, res) => {
  try {
    const shops = await Shop.find()
      .populate('owner', 'firstName lastName email username')
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({ success: true, data: shops });
  } catch (error) {
    console.error('Admin shops error:', error);
    res.status(500).json({ success: false, message: 'Failed to load shops' });
  }
});

router.patch('/shops/:shopId', async (req, res) => {
  try {
    const { isActive, isVerified } = req.body;
    const updates = {};
    if (typeof isActive === 'boolean') updates.isActive = isActive;
    if (typeof isVerified === 'boolean') updates.isVerified = isVerified;

    const shop = await Shop.findByIdAndUpdate(req.params.shopId, updates, {
      new: true,
    });

    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    res.json({ success: true, data: shop });
  } catch (error) {
    console.error('Admin update shop error:', error);
    res.status(500).json({ success: false, message: 'Failed to update shop' });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Admin orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to load orders' });
  }
});

router.get('/reviews/disputes', async (req, res) => {
  try {
    const reviews = await Review.find({ 'dispute.status': 'open' })
      .sort({ updatedAt: -1 })
      .limit(50);

    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Admin disputes error:', error);
    res.status(500).json({ success: false, message: 'Failed to load disputes' });
  }
});

module.exports = router;
