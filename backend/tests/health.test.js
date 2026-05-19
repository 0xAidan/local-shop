const request = require('supertest');
const app = require('../src/index');

describe('Health endpoint', () => {
  it('returns API status', async () => {
    const response = await request(app).get('/health');
    expect([200, 503]).toContain(response.status);
    expect(response.body).toHaveProperty('message');
  });
});
