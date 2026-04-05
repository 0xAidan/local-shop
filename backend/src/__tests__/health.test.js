const request = require('supertest');

describe('Health endpoint', () => {
  let app;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    app = require('../app');
  });

  it('GET /health returns OK', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(res.body.status).toBe('OK');
  });
});
