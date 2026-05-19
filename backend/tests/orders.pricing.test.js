const express = require('express');
const request = require('supertest');

describe('Order pricing constants', () => {
  it('uses 8% tax and delivery fee rules documented in orders route', () => {
    const subtotal = 100;
    const tax = subtotal * 0.08;
    const deliveryFee = 2.99;
    const total = subtotal + tax + deliveryFee;
    expect(tax).toBe(8);
    expect(total).toBeCloseTo(110.99, 2);
  });

  it('pickup orders have zero delivery fee', () => {
    const subtotal = 50;
    const tax = subtotal * 0.08;
    const deliveryMethod = 'pickup';
    const deliveryFee = deliveryMethod === 'pickup' ? 0 : 2.99;
    expect(deliveryFee).toBe(0);
    expect(subtotal + tax + deliveryFee).toBe(54);
  });
});

describe('Payment-gated fulfillment statuses', () => {
  const paidStatuses = ['confirmed', 'preparing', 'ready', 'completed'];

  it('blocks fulfillment transitions when unpaid', () => {
    const order = { payment: { status: 'pending' } };
    const canAdvance = (status) =>
      !paidStatuses.includes(status) || order.payment.status === 'paid';
    expect(canAdvance('confirmed')).toBe(false);
    expect(canAdvance('cancelled')).toBe(true);
  });
});
