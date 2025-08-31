const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// Create a new order
router.post('/', auth, async (req, res) => {
  try {
    const { shopId, items, delivery, payment } = req.body;
    const user = req.user;

    // Validate required fields
    if (!shopId || !items || !delivery || !payment) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: shopId, items, delivery, payment'
      });
    }

    // Get shop information
    const Shop = require('../models/Shop');
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Calculate order totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`
        });
      }

      // Check inventory for stock products
      if (product.productType === 'stock' && product.inventory) {
        if (product.inventory.quantity < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient inventory for ${product.name}. Available: ${product.inventory.quantity}`
          });
        }
        // Reduce inventory
        product.inventory.quantity -= item.quantity;
        await product.save();
      }

      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: item.productId,
        name: product.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: itemTotal,
        productType: product.productType || 'stock'
      });
    }

    const tax = subtotal * 0.08; // 8% tax
    const deliveryFee = delivery.method === 'pickup' ? 0 : 2.99;
    const total = subtotal + tax + deliveryFee;
    const platformFee = total * 0.029 + 0.30; // 2.9% + $0.30
    const netAmount = total - platformFee;

    // Create order
    const order = new Order({
      customer: {
        userId: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        address: user.location
      },
      shop: {
        shopId: shop._id,
        name: shop.name,
        location: shop.location
      },
      items: orderItems,
      subtotal,
      tax,
      deliveryFee,
      total,
      delivery: {
        method: delivery.method,
        address: delivery.address,
        instructions: delivery.instructions,
        estimatedTime: delivery.method === 'pickup' ? '15-30 mins' : '2-4 hours'
      },
      payment: {
        method: payment.method,
        status: 'paid',
        transactionId: `txn_${Date.now()}`,
        paidAt: new Date()
      },
      financials: {
        platformFee,
        netAmount,
        currency: 'CAD'
      }
    });

    await order.save();

    // Create notification for shop owner
    try {
      const Shop = require('../models/Shop');
      const shop = await Shop.findById(shopId);
      if (shop && shop.owner) {
        await Notification.createNewOrderNotification(order, shop.owner);
      }
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
      // Don't fail the order creation if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
});
const mongoose = require('mongoose');

// Get all orders for a shop (shop owner only)
router.get('/shop/:shopId', auth, async (req, res) => {
  try {
    const { shopId } = req.params;
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    // Verify the user owns this shop
    const user = req.user;
    const userShops = user.shops || [];
    
    if (!userShops.includes(shopId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only view orders for your own shops.' 
      });
    }

    // Build query options
    const options = {};
    if (status) {
      options.status = status;
    }
    
    if (startDate && endDate) {
      options.dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      };
    }

    // Get orders with pagination
    const skip = (page - 1) * limit;
    const orders = await Order.findByShop(shopId, options)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalOrders = await Order.countDocuments({ 'shop.shopId': shopId });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalOrders / limit),
          totalOrders,
          hasNext: page * limit < totalOrders,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching shop orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch orders' 
    });
  }
});

// Get a specific order by ID
router.get('/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate('customer.userId', 'firstName lastName email phone')
      .populate('items.product', 'name images category description')
      .populate('shop.shopId', 'name location category');

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Verify access - either customer or shop owner
    const user = req.user;
    const isCustomer = order.customer.userId.toString() === user._id.toString();
    const isShopOwner = user.shops && user.shops.includes(order.shop.shopId.toString());

    if (!isCustomer && !isShopOwner) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch order' 
    });
  }
});

// Update order status (shop owner only)
router.patch('/:orderId/status', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes } = req.body;
    const user = req.user;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Verify the user owns this shop
    if (!user.shops || !user.shops.includes(order.shop.shopId.toString())) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only update orders for your own shops.' 
      });
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['preparing', 'cancelled'],
      'preparing': ['ready', 'cancelled'],
      'ready': ['completed', 'cancelled'],
      'completed': [], // Final state
      'cancelled': [], // Final state
      'refunded': [] // Final state
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${order.status} to ${status}`
      });
    }

    // Update order status
    order.status = status;
    order.statusUpdatedAt = new Date();
    
    // If order is cancelled or refunded, restore inventory
    if (status === 'cancelled' || status === 'refunded') {
      await restoreInventory(order.items);
    }

    await order.save();

    // Create notification for shop owner about status change
    try {
      const Shop = require('../models/Shop');
      const shop = await Shop.findById(order.shop.shopId);
      if (shop && shop.owner) {
        await Notification.createStatusChangeNotification(order, shop.owner, status);
      }
    } catch (notificationError) {
      console.error('Failed to create status change notification:', notificationError);
      // Don't fail the status update if notification fails
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update order status' 
    });
  }
});

// Process refund (shop owner only)
router.post('/:orderId/refund', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { refundAmount, reason, items } = req.body;
    const user = req.user;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Verify the user owns this shop
    if (!user.shops || !user.shops.includes(order.shop.shopId.toString())) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only refund orders for your own shops.' 
      });
    }

    // Check if order is eligible for refund
    if (order.status === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'Order has already been refunded'
      });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot refund a cancelled order'
      });
    }

    // Validate refund amount
    if (refundAmount > order.total) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount cannot exceed order total'
      });
    }

    // Process refund
    order.status = 'refunded';
    order.payment.status = 'refunded';
    order.statusUpdatedAt = new Date();

    // Add refund details
    order.refund = {
      amount: refundAmount,
      reason,
      processedAt: new Date(),
      processedBy: user._id
    };

    // Restore inventory for refunded items
    if (items && items.length > 0) {
      await restoreInventory(items);
    } else {
      // Full refund - restore all items
      await restoreInventory(order.items);
    }

    await order.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: order
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process refund' 
    });
  }
});

// Get order statistics for a shop
router.get('/shop/:shopId/stats', auth, async (req, res) => {
  try {
    const { shopId } = req.params;
    const { period = '30days' } = req.query;
    
    // Verify the user owns this shop
    const user = req.user;
    if (!user.shops || !user.shops.includes(shopId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7days':
        startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        break;
      case '30days':
        startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        break;
      case '90days':
        startDate = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
        break;
      default:
        startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    }

    // Get order statistics
    const stats = await Order.aggregate([
      {
        $match: {
          'shop.shopId': mongoose.Types.ObjectId(shopId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$total' }
        }
      }
    ]);

    // Get total orders and revenue
    const totalStats = await Order.aggregate([
      {
        $match: {
          'shop.shopId': mongoose.Types.ObjectId(shopId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' }
        }
      }
    ]);

    // Format response
    const statusCounts = {};
    stats.forEach(stat => {
      statusCounts[stat._id] = {
        count: stat.count,
        revenue: stat.totalRevenue
      };
    });

    res.json({
      success: true,
      data: {
        period,
        startDate,
        endDate: now,
        statusCounts,
        totals: totalStats[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          avgOrderValue: 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch order statistics' 
    });
  }
});

// Helper function to restore inventory
async function restoreInventory(items) {
  for (const item of items) {
    try {
      const product = await Product.findById(item.product);
      if (product && product.inventory) {
        // Only restore inventory for stock products
        if (product.productType === 'stock') {
          product.inventory.quantity += item.quantity;
          await product.save();
        }
      }
    } catch (error) {
      console.error(`Error restoring inventory for product ${item.product}:`, error);
    }
  }
}

module.exports = router; 