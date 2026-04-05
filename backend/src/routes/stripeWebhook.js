const express = require('express');
const { getStripe } = require('../config/stripe');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');

const router = express.Router();

async function deductInventoryForOrder(order) {
  for (const line of order.items) {
    try {
      const product = await Product.findById(line.product);
      if (product && product.productType === 'stock' && product.inventory) {
        product.inventory.quantity -= line.quantity;
        if (product.inventory.quantity < 0) {
          product.inventory.quantity = 0;
        }
        await product.save();
      }
    } catch (e) {
      console.error('Inventory deduct error:', e);
    }
  }
}

async function restoreInventoryForOrder(order) {
  for (const line of order.items) {
    try {
      const product = await Product.findById(line.product);
      if (product && product.productType === 'stock' && product.inventory) {
        product.inventory.quantity += line.quantity;
        await product.save();
      }
    } catch (e) {
      console.error('Inventory restore error:', e);
    }
  }
}

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const stripe = getStripe();
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripe || !secret) {
      return res.status(503).send('Stripe webhook not configured');
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], secret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      if (event.type === 'payment_intent.succeeded') {
        const pi = event.data.object;
        const orderId = pi.metadata?.orderId;
        if (!orderId) {
          return res.json({ received: true });
        }

        const order = await Order.findById(orderId);
        if (!order) {
          return res.json({ received: true });
        }

        if (order.payment.status !== 'paid') {
          order.payment.status = 'paid';
          order.payment.paidAt = new Date();
          order.payment.transactionId = pi.id;
          order.stripeChargeId = pi.latest_charge || order.stripeChargeId;
          order.status = 'confirmed';
          order.statusUpdatedAt = new Date();
          await order.save();
          await deductInventoryForOrder(order);

          try {
            const Shop = require('../models/Shop');
            const shop = await Shop.findById(order.shop.shopId);
            if (shop && shop.owner) {
              await Notification.createNewOrderNotification(order, shop.owner);
            }
          } catch (e) {
            console.error('Notification error:', e);
          }
        }
      }

      if (event.type === 'payment_intent.payment_failed') {
        const pi = event.data.object;
        const orderId = pi.metadata?.orderId;
        if (orderId) {
          const order = await Order.findById(orderId);
          if (order && order.payment.status === 'pending') {
            order.payment.status = 'failed';
            order.status = 'cancelled';
            order.statusUpdatedAt = new Date();
            await order.save();
          }
        }
      }

      if (event.type === 'charge.refunded') {
        const charge = event.data.object;
        const piId = charge.payment_intent;
        if (piId) {
          const order = await Order.findOne({ paymentIntentId: piId });
          if (order) {
            const refunded = charge.amount_refunded || 0;
            const totalCents = Math.round(order.total * 100);
            if (refunded >= totalCents) {
              order.payment.status = 'refunded';
              order.status = 'refunded';
            } else if (refunded > 0) {
              order.payment.status = 'partially_refunded';
            }
            order.statusUpdatedAt = new Date();
            await order.save();
            if (order.payment.status === 'refunded') {
              await restoreInventoryForOrder(order);
            }
          }
        }
      }
    } catch (handlerErr) {
      console.error('Webhook handler error:', handlerErr);
      return res.status(500).json({ error: 'handler failed' });
    }

    res.json({ received: true });
  }
);

module.exports = router;
