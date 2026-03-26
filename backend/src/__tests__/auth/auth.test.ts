import request from 'supertest';
import { Application } from 'express';
import { setupTestApp, teardownTestApp } from '../helpers/testApp';
import User from '../../models/User';

describe('Auth API', () => {
  let app: Application;

  beforeAll(async () => {
    app = await setupTestApp();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  beforeEach(async () => {
    // Clear users before each test
    await User.destroy({ where: {} });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // Create test user (password will be hashed by beforeCreate hook)
      await User.create({
        name: 'testadmin',
        email: 'test@aurva.kg',
        password: 'password123',
        role: 'admin',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@aurva.kg',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@aurva.kg');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should reject wrong password', async () => {
      // Create test user (password will be hashed by beforeCreate hook)
      await User.create({
        name: 'testuser',
        email: 'user@aurva.kg',
        password: 'correctpassword',
        role: 'admin',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@aurva.kg',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get profile with valid token', async () => {
      // Create test user and login (password will be hashed by beforeCreate hook)
      await User.create({
        name: 'testadmin',
        email: 'test@aurva.kg',
        password: 'password123',
        role: 'admin',
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@aurva.kg',
          password: 'password123',
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@aurva.kg');
    });

    it('should reject request without token', async () => {
      const response = await request(app).get('/api/auth/profile');

      expect(response.status).toBe(401);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalidtoken123');

      // Current implementation returns 403 for invalid tokens (technical debt)
      // TODO: Should return 401 per HTTP standards
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/auth/change-password', () => {
    it('should change password with valid credentials', async () => {
      // Create test user and login (password will be hashed by beforeCreate hook)
      await User.create({
        name: 'testadmin',
        email: 'test@aurva.kg',
        password: 'oldpassword',
        role: 'admin',
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@aurva.kg',
          password: 'oldpassword',
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'oldpassword',
          newPassword: 'newpassword123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Try logging in with new password
      const newLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@aurva.kg',
          password: 'newpassword123',
        });

      expect(newLoginResponse.status).toBe(200);
    });

    it('should reject with wrong current password', async () => {
      // Create test user and login (password will be hashed by beforeCreate hook)
      await User.create({
        name: 'testadmin',
        email: 'test@aurva.kg',
        password: 'correctpassword',
        role: 'admin',
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@aurva.kg',
          password: 'correctpassword',
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        });

      expect(response.status).toBe(401);
    });
  });
});
