const {
  getDeliveryFee,
  getDeliveryEstimatedTime,
  normalizeDeliveryMethod,
} = require('../src/utils/deliveryFees');

describe('deliveryFees', () => {
  it('charges standard delivery fee', () => {
    expect(getDeliveryFee('delivery')).toBe(2.99);
    expect(getDeliveryFee(normalizeDeliveryMethod('standard'))).toBe(2.99);
  });

  it('charges express delivery fee', () => {
    expect(getDeliveryFee('express')).toBe(5.99);
  });

  it('pickup is free', () => {
    expect(getDeliveryFee('pickup')).toBe(0);
  });

  it('normalizes mobile standard to delivery', () => {
    expect(normalizeDeliveryMethod('standard')).toBe('delivery');
  });

  it('returns estimated times', () => {
    expect(getDeliveryEstimatedTime('pickup')).toBe('15-30 mins');
    expect(getDeliveryEstimatedTime('express')).toBe('1 hour');
    expect(getDeliveryEstimatedTime('delivery')).toBe('2-4 hours');
  });
});
