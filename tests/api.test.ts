import request from 'supertest';
import app from '../src/app'; // Adjust if your Next.js API is exported differently

describe('POST /api/register', () => {
  it('should return 400 for missing fields', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // Add more tests for valid registration, duplicate user, etc.
});

describe('POST /api/login', () => {
  it('should return 400 for missing credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // Add more tests for valid login, invalid credentials, etc.
});
