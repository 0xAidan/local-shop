const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Shop = require('../models/Shop');
const { authenticateToken, requireShopOwner } = require('../middleware/auth');
const { userOwnsShop } = require('../utils/shopAccess');
const {
  isStripeEnabled,
  createPaymentIntentForOrder,
  createConnectAccountLink,
  refreshConnectAccountStatus,
} = require('../services/stripe');

router.post('/orders/:orderId/intent', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isCustomer = order.customer.userId.toString() === req.user._id.toString();
    if (!isCustomer) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (order.payment.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Order is already paid' });
    }

    const shop = await Shop.findById(order.shop.shopId);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const paymentResult = await createPaymentIntentForOrder(order, shop);

    if (paymentResult.devBypass) {
      order.payment.status = 'paid';
      order.payment.transactionId = `dev_${Date.now()}`;
      order.payment.paidAt = new Date();
      order.status = 'confirmed';
      await order.save();
      return res.json({
        success: true,
        data: { devBypass: true, order },
      });
    }

    order.payment.transactionId = paymentResult.paymentIntentId;
    order.payment.status = 'pending';
    await order.save();

    res.json({
      success: true,
      data: {
        clientSecret: paymentResult.clientSecret,
        paymentIntentId: paymentResult.paymentIntentId,
        orderId: order._id,
      },
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment intent',
    });
  }
});

router.post('/connect/onboard/:shopId', authenticateToken, requireShopOwner, async (req, res) => {
  try {
    const { shopId } = req.params;
    if (!userOwnsShop(req.user, shopId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const refreshUrl = req.body.refreshUrl || process.env.STRIPE_CONNECT_REFRESH_URL;
    const returnUrl = req.body.returnUrl || process.env.STRIPE_CONNECT_RETURN_URL;

    if (!refreshUrl || !returnUrl) {
      return res.status(400).json({
        success: false,
        message: 'STRIPE_CONNECT_REFRESH_URL and STRIPE_CONNECT_RETURN_URL must be configured',
      });
    }

    const link = await createConnectAccountLink(shop, refreshUrl, returnUrl);
    res.json({ success: true, data: link });
  } catch (error) {
    console.error('Connect onboard error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to start Stripe Connect onboarding',
    });
  }
});

router.get('/connect/status/:shopId', authenticateToken, requireShopOwner, async (req, res) => {
  try {
    const { shopId } = req.params;
    if (!userOwnsShop(req.user, shopId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const updated = await refreshConnectAccountStatus(shop);
    res.json({
      success: true,
      data: {
        stripeConnectAccountId: updated.stripeConnectAccountId,
        stripeConnectChargesEnabled: updated.stripeConnectChargesEnabled,
        stripeConnectPayoutsEnabled: updated.stripeConnectPayoutsEnabled,
        stripeConnectDetailsSubmitted: updated.stripeConnectDetailsSubmitted,
      },
    });
  } catch (error) {
    console.error('Connect status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch Connect status',
    });
  }
});

router.get('/config', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      stripeEnabled: isStripeEnabled(),
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
    },
  });
});

module.exports = router;
