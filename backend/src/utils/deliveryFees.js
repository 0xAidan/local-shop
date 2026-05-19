/**
 * Delivery fees must match LocalShop/src/screens/CheckoutScreen.tsx options.
 */
const getDeliveryFee = (method) => {
  if (method === 'pickup') return 0;
  if (method === 'express') return 5.99;
  // standard (mobile) is stored as delivery
  return 2.99;
};

const getDeliveryEstimatedTime = (method) => {
  if (method === 'pickup') return '15-30 mins';
  if (method === 'express') return '1 hour';
  return '2-4 hours';
};

/** Normalize mobile checkout ids to Order.delivery.method enum values. */
const normalizeDeliveryMethod = (method) => {
  if (method === 'standard') return 'delivery';
  if (['pickup', 'delivery', 'express'].includes(method)) return method;
  return 'delivery';
};

module.exports = {
  getDeliveryFee,
  getDeliveryEstimatedTime,
  normalizeDeliveryMethod,
};
