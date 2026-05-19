const { getPlatformFeeCents, getPlatformFeeDollars } = require('../src/services/stripe');

describe('Stripe platform fees', () => {
  beforeEach(() => {
    process.env.STRIPE_PLATFORM_FEE_PERCENT = '2.9';
    process.env.STRIPE_PLATFORM_FEE_FIXED_CENTS = '30';
  });

  it('calculates fee in cents for a typical order', () => {
    expect(getPlatformFeeCents(10000)).toBe(320);
  });

  it('calculates fee in dollars aligned with cents helper', () => {
    const total = 42.5;
    expect(getPlatformFeeDollars(total)).toBe(getPlatformFeeCents(Math.round(total * 100)) / 100);
  });
});
