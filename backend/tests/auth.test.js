const request = require('supertest');
const express = require('express');

const healthApp = express();
healthApp.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

describe('health', () => {
  it('returns ok', async () => {
    const res = await request(healthApp).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
