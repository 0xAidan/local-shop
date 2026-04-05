const express = require('express');
const { getStripe } = require('../config/stripe');
const { authenticateToken } = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');

const router = express.Router();

/** Simple coupon registry — extend with DB or Stripe Promotion Codes later */
const applyCoupon = (subtotal, couponCode) => {
  if (!couponCode || typeof couponCode !== 'string') {
    return { discountAmount: 0, couponId: null };
  }
  const code = couponCode.trim().toUpperCase();
  if (code === 'WELCOME10') {
    const discountAmount = Math.round(subtotal * 0.1 * 100) / 100;
    return { discountAmount, couponId: code };
  }
  if (code === 'SAVE5') {
    return { discountAmount: Math.min(5, subtotal), couponId: code };
  }
  const err = new Error('Invalid or expired coupon code');
  err.status = 400;
  throw err;
};

const deliveryFeeFor = (delivery) => {
  const method = delivery?.method || 'standard';
  if (method === 'pickup') return 0;
  if (method === 'express') return 5.99;
  return 2.99;
};

/** Order model only allows pickup | delivery | express */
const normalizeDeliveryMethod = (method) => {
  if (method === 'pickup') return 'pickup';
  if (method === 'express') return 'express';
  return 'delivery';
};

/**
 * POST /api/checkout/create-payment-intent
 * Body: { shopId, items: [{ productId, quantity }], delivery, payment: { method }, couponCode? }
 * Prices are taken from the database (client prices are ignored except for validation tolerance).
 */
router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({
      success: false,
      message: 'Payments are not configured (missing STRIPE_SECRET_KEY)',
    });
  }

  try {
    const { shopId, items, delivery, payment, couponCode } = req.body;
    const user = req.user;

    if (!shopId || !items?.length || !delivery || !payment?.method) {
      return res.status(400).json({
        success: false,
        message: 'Missing shopId, items, delivery, or payment.method',
      });
    }

    const Shop = require('../models/Shop');
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`,
        });
      }

      if (String(product.shop) !== String(shopId)) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} does not belong to this shop`,
        });
      }

      const qty = parseInt(item.quantity, 10);
      if (Number.isNaN(qty) || qty < 1) {
        return res.status(400).json({ success: false, message: 'Invalid quantity' });
      }

      const unitPrice = Number(product.price);
      if (product.productType === 'stock' && product.inventory) {
        if (product.inventory.quantity < qty) {
          return res.status(400).json({
            success: false,
            message: `Insufficient inventory for ${product.name}`,
          });
        }
      }

      const lineTotal = Math.round(unitPrice * qty * 100) / 100;
      subtotal += lineTotal;
      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: qty,
        unitPrice,
        totalPrice: lineTotal,
        productType: product.productType || 'stock',
      });
    }

    const { discountAmount, couponId } = applyCoupon(subtotal, couponCode);
    const afterDiscount = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);
    const deliveryFee = deliveryFeeFor(delivery);
    const taxable = afterDiscount + deliveryFee;
    const tax = Math.round(taxable * 0.08 * 100) / 100;
    const total = Math.round((taxable + tax) * 100) / 100;
    const platformFee = Math.round((total * 0.029 + 0.3) * 100) / 100;
    const netAmount = Math.round((total - platformFee) * 100) / 100;

    const deliveryMethodNorm = normalizeDeliveryMethod(delivery.method);

    const currency = (process.env.DEFAULT_CURRENCY || 'cad').toLowerCase();
    const amountCents = Math.round(total * 100);

    const order = new Order({
      customer: {
        userId: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        address: user.location,
      },
      shop: {
        shopId: shop._id,
        name: shop.name,
        location: shop.location,
      },
      items: orderItems,
      subtotal,
      tax,
      deliveryFee,
      discountAmount,
      couponCode: couponId,
      total,
      delivery: {
        method: deliveryMethodNorm,
        address: delivery.address,
        instructions: delivery.instructions,
        estimatedTime:
          deliveryMethodNorm === 'pickup'
            ? '15-30 mins'
            : deliveryMethodNorm === 'express'
              ? '1 hour'
              : '2-4 hours',
      },
      payment: {
        method: payment.method,
        status: 'pending',
      },
      financials: {
        platformFee,
        netAmount,
        currency: currency.toUpperCase(),
      },
      status: 'pending',
    });

    await order.save();

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: amountCents,
        currency,
        automatic_payment_methods: { enabled: true },
        metadata: {
          orderId: order._id.toString(),
          userId: user._id.toString(),
          shopId: shop._id.toString(),
        },
        description: `LocalShop order ${order._id}`,
      },
      { idempotencyKey: `order_${order._id}` }
    );

    order.paymentIntentId = paymentIntent.id;
    await order.save();

    res.status(201).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        orderId: order._id.toString(),
        amount: total,
        currency: currency.toUpperCase(),
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      },
    });
  } catch (error) {
    console.error('create-payment-intent:', error);
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Failed to create payment',
    });
  }
});

module.exports = router;
