const express = require('express');
const Order = require('../models/Order');
const StripeWebhookEvent = require('../models/StripeWebhookEvent');
const { getStripe, syncConnectAccountByStripeId } = require('../services/stripe');
const { reserveInventoryForOrder } = require('../utils/orderInventory');

const router = express.Router();

const markInventoryForPaidOrder = async (order) => {
  if (order.inventoryAdjusted) {
    return;
  }
  await reserveInventoryForOrder(order.items);
  order.inventoryAdjusted = true;
};

router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return res.status(503).send('Stripe webhooks not configured');
  }

  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    const existing = await StripeWebhookEvent.findOne({ eventId: event.id });
    if (existing) {
      return res.json({ received: true, duplicate: true });
    }

    await StripeWebhookEvent.create({ eventId: event.id, type: event.type });

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;
        if (!orderId) break;

        const order = await Order.findById(orderId);
        if (!order) break;

        await markInventoryForPaidOrder(order);

        order.payment.status = 'paid';
        order.payment.transactionId = paymentIntent.id;
        order.payment.paidAt = new Date();
        if (order.status === 'pending') {
          order.status = 'confirmed';
        }
        await order.save();
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;
        if (!orderId) break;

        const order = await Order.findById(orderId);
        if (!order) break;

        order.payment.status = 'failed';
        await order.save();
        break;
      }
      case 'account.updated': {
        const account = event.data.object;
        if (account?.id) {
          await syncConnectAccountByStripeId(account.id);
        }
        break;
      }
      default:
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ success: false, message: 'Webhook handler failed' });
  }
});

module.exports = router;
