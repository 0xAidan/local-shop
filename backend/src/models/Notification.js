const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Recipient (shop owner)
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Shop this notification is about
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },

  // Order this notification is about (if applicable)
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },

  // Notification type
  type: {
    type: String,
    enum: [
      'new_order',
      'order_confirmed',
      'order_preparing',
      'order_ready',
      'order_completed',
      'order_cancelled',
      'order_refunded',
      'low_inventory',
      'daily_summary'
    ],
    required: true
  },

  // Notification title
  title: {
    type: String,
    required: true
  },

  // Notification message
  message: {
    type: String,
    required: true
  },

  // Additional data
  data: {
    orderNumber: String,
    customerName: String,
    orderTotal: Number,
    itemCount: Number,
    status: String
  },

  // Read status
  isRead: {
    type: Boolean,
    default: false
  },

  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  readAt: Date,
  expiresAt: Date
}, {
  timestamps: true
});

// Indexes for performance
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ shop: 1, type: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware to set expiration for certain notification types
notificationSchema.pre('save', function(next) {
  if (this.isNew) {
    // Set expiration based on notification type
    switch (this.type) {
      case 'new_order':
        this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        this.priority = 'high';
        break;
      case 'order_ready':
        this.expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
        this.priority = 'medium';
        break;
      case 'daily_summary':
        this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
        this.priority = 'low';
        break;
      default:
        this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        this.priority = 'medium';
    }
  }
  next();
});

// Static method to create notification for new order
notificationSchema.statics.createNewOrderNotification = async function(order, shopOwnerId) {
  const notification = new this({
    recipient: shopOwnerId,
    shop: order.shop.shopId,
    order: order._id,
    type: 'new_order',
    title: 'New Order Received',
    message: `New order #${order._id.toString().slice(-8)} from ${order.customer.name}`,
    data: {
      orderNumber: order._id.toString().slice(-8),
      customerName: order.customer.name,
      orderTotal: order.total,
      itemCount: order.items.length,
      status: order.status
    }
  });

  return await notification.save();
};

// Static method to create notification for order status change
notificationSchema.statics.createStatusChangeNotification = async function(order, shopOwnerId, newStatus) {
  const statusMessages = {
    'confirmed': 'Order confirmed and ready for preparation',
    'preparing': 'Order preparation started',
    'ready': 'Order is ready for pickup/delivery',
    'completed': 'Order completed successfully',
    'cancelled': 'Order has been cancelled',
    'refunded': 'Order refund processed'
  };

  const notification = new this({
    recipient: shopOwnerId,
    shop: order.shop.shopId,
    order: order._id,
    type: `order_${newStatus}`,
    title: `Order ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
    message: statusMessages[newStatus] || `Order status changed to ${newStatus}`,
    data: {
      orderNumber: order._id.toString().slice(-8),
      customerName: order.customer.name,
      orderTotal: order.total,
      itemCount: order.items.length,
      status: newStatus
    }
  });

  return await notification.save();
};

// Static method to get unread notifications for a user
notificationSchema.statics.getUnreadNotifications = function(userId, limit = 20) {
  return this.find({ recipient: userId, isRead: false })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('shop', 'name')
    .populate('order', 'status total');
};

// Static method to mark notification as read
notificationSchema.statics.markAsRead = function(notificationId, userId) {
  return this.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
};

// Static method to mark all notifications as read for a user
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

module.exports = mongoose.model('Notification', notificationSchema); 