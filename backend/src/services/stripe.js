let stripeClient = null;

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  if (!stripeClient) {
    // eslint-disable-next-line global-require
    const Stripe = require('stripe');
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    });
  }
  return stripeClient;
};

const isStripeEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY);

const allowDevPaymentBypass = () =>
  process.env.NODE_ENV !== 'production' && process.env.STRIPE_SKIP_PAYMENTS === 'true';

const getPlatformFeeCents = (amountCents) => {
  const percent = Number(process.env.STRIPE_PLATFORM_FEE_PERCENT || 2.9);
  const fixed = Number(process.env.STRIPE_PLATFORM_FEE_FIXED_CENTS || 30);
  return Math.round(amountCents * (percent / 100) + fixed);
};

const getPlatformFeeDollars = (totalDollars) => {
  const amountCents = Math.round(totalDollars * 100);
  return getPlatformFeeCents(amountCents) / 100;
};

const createPaymentIntentForOrder = async (order, shop, options = {}) => {
  const stripe = getStripe();
  if (!stripe) {
    if (allowDevPaymentBypass()) {
      return { devBypass: true };
    }
    throw new Error('Stripe is not configured');
  }

  if (order.payment.transactionId && order.payment.status === 'pending') {
    try {
      const existing = await stripe.paymentIntents.retrieve(order.payment.transactionId);
      if (existing.status === 'requires_payment_method' || existing.status === 'requires_confirmation' || existing.status === 'requires_action') {
        return {
          clientSecret: existing.client_secret,
          paymentIntentId: existing.id,
          devBypass: false,
          reused: true,
        };
      }
    } catch (error) {
      console.warn('Could not retrieve existing PaymentIntent, creating new one:', error.message);
    }
  }

  const amountCents = Math.round(order.total * 100);
  const applicationFeeAmount = getPlatformFeeCents(amountCents);

  const intentParams = {
    amount: amountCents,
    currency: (order.financials?.currency || 'cad').toLowerCase(),
    metadata: {
      orderId: order._id.toString(),
      shopId: order.shop.shopId.toString(),
    },
    automatic_payment_methods: { enabled: true },
  };

  if (shop.stripeConnectAccountId && shop.stripeConnectChargesEnabled) {
    intentParams.transfer_data = { destination: shop.stripeConnectAccountId };
    intentParams.application_fee_amount = applicationFeeAmount;
  }

  const requestOptions = {};
  const idempotencyKey = options.idempotencyKey || `order_${order._id}`;
  requestOptions.idempotencyKey = idempotencyKey;

  const paymentIntent = await stripe.paymentIntents.create(intentParams, requestOptions);

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    devBypass: false,
    reused: false,
  };
};

const createConnectAccountLink = async (shop, refreshUrl, returnUrl) => {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  let accountId = shop.stripeConnectAccountId;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      country: process.env.STRIPE_CONNECT_COUNTRY || 'CA',
      email: shop.contact?.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: shop.name,
      },
      metadata: {
        shopId: shop._id.toString(),
      },
    });
    accountId = account.id;
    shop.stripeConnectAccountId = accountId;
    await shop.save();
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  });

  return {
    url: accountLink.url,
    accountId,
  };
};

const refreshConnectAccountStatus = async (shop) => {
  const stripe = getStripe();
  if (!stripe || !shop.stripeConnectAccountId) {
    return shop;
  }

  const account = await stripe.accounts.retrieve(shop.stripeConnectAccountId);
  shop.stripeConnectChargesEnabled = Boolean(account.charges_enabled);
  shop.stripeConnectPayoutsEnabled = Boolean(account.payouts_enabled);
  shop.stripeConnectDetailsSubmitted = Boolean(account.details_submitted);
  await shop.save();
  return shop;
};

const syncConnectAccountByStripeId = async (accountId) => {
  const stripe = getStripe();
  if (!stripe) {
    return null;
  }

  const Shop = require('../models/Shop');
  const shop = await Shop.findOne({ stripeConnectAccountId: accountId });
  if (!shop) {
    return null;
  }

  return refreshConnectAccountStatus(shop);
};

const refundPaymentIntent = async (paymentIntentId, amountCents) => {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const params = { payment_intent: paymentIntentId };
  if (amountCents) {
    params.amount = amountCents;
  }

  return stripe.refunds.create(params);
};

module.exports = {
  getStripe,
  isStripeEnabled,
  allowDevPaymentBypass,
  getPlatformFeeCents,
  getPlatformFeeDollars,
  createPaymentIntentForOrder,
  createConnectAccountLink,
  refreshConnectAccountStatus,
  syncConnectAccountByStripeId,
  refundPaymentIntent,
};
