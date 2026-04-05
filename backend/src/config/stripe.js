const Stripe = require('stripe');

let stripeSingleton = null;

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return null;
  }
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key, { apiVersion: '2023-10-16' });
  }
  return stripeSingleton;
};

module.exports = { getStripe };
