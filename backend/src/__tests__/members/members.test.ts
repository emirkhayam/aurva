import request from 'supertest';
import { Application } from 'express';
import { setupTestApp, teardownTestApp } from '../helpers/testApp';
import Member from '../../models/Member';
import User from '../../models/User';

describe('Members API', () => {
  let app: Application;
  let authToken: string;

  beforeAll(async () => {
    app = await setupTestApp();

    // Create admin user for protected routes
    await User.create({
      name: 'testadmin',
      email: 'admin@aurva.kg',
      password: 'admin123',
      role: 'admin',
    });

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@aurva.kg',
        password: 'admin123',
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  beforeEach(async () => {
    // Clear members before each test
    await Member.destroy({ where: {} });
  });

  describe('GET /api/members (Public)', () => {
    beforeEach(async () => {
      // Create test members
      await Member.create({
        name: 'BitHub',
        slug: 'bithub',
        description: 'Crypto exchange',
        logoUrl: '/uploads/bithub.png',
        website: 'https://bithub.kg',
        isActive: true,
      });
      await Member.create({
        name: 'Envoys',
        slug: 'envoys',
        description: 'Payment system',
        logoUrl: '/uploads/envoys.png',
        website: 'https://envoys.vision',
        isActive: true,
      });
      await Member.create({
        name: 'Inactive Member',
        slug: 'inactive',
        description: 'Inactive',
        isActive: false,
      });
    });

    it('should get all active members', async () => {
      const response = await request(app).get('/api/members');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('members');
      expect(response.body.members.length).toBe(2); // Only active
    });

    it('should support pagination', async () => {
      const response = await request(app).get('/api/members?page=1&limit=1');

      expect(response.status).toBe(200);
      expect(response.body.members).toHaveLength(1);
      expect(response.body.pagination.total).toBe(2);
    });
  });

  describe('GET /api/members/:slug (Public)', () => {
    beforeEach(async () => {
      await Member.create({
        name: 'BitHub',
        slug: 'bithub',
        description: 'Crypto exchange in Kyrgyzstan',
        logoUrl: '/uploads/bithub.png',
        website: 'https://bithub.kg',
        isActive: true,
      });
    });

    it('should get member by slug', async () => {
      const response = await request(app).get('/api/members/bithub');

      expect(response.status).toBe(200);
      expect(response.body.member.slug).toBe('bithub');
      expect(response.body.member.name).toBe('BitHub');
    });

    it('should return 404 for non-existent slug', async () => {
      const response = await request(app).get('/api/members/non-existent');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/members (Protected)', () => {
    it('should create member with valid data', async () => {
      const response = await request(app)
        .post('/api/members')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'WeChange',
          slug: 'wechange',
          description: 'Exchange service',
          website: 'https://wechange.kg',
          isActive: true,
        });

      expect(response.status).toBe(201);
      expect(response.body.member.name).toBe('WeChange');
      expect(response.body.member.slug).toBe('wechange');
    });

    it('should auto-generate slug from name if not provided', async () => {
      const response = await request(app)
        .post('/api/members')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Royal Inc.',
          description: 'Financial services',
        });

      expect(response.status).toBe(201);
      expect(response.body.member.slug).toMatch(/royal/);
    });

    it('should reject member without name', async () => {
      const response = await request(app)
        .post('/api/members')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Description',
        });

      expect(response.status).toBe(400);
    });

    it('should reject duplicate slug', async () => {
      // Create first member
      await Member.create({
        name: 'First',
        slug: 'test-slug',
        description: 'First',
      });

      // Try to create second with same slug
      const response = await request(app)
        .post('/api/members')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Second',
          slug: 'test-slug',
          description: 'Second',
        });

      expect(response.status).toBe(400);
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .post('/api/members')
        .send({
          name: 'Test',
          description: 'Test',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/members/:id (Protected)', () => {
    let memberId: number;

    beforeEach(async () => {
      const member = await Member.create({
        name: 'Original Name',
        slug: 'original-slug',
        description: 'Original description',
        isActive: false,
      });
      memberId = member.id;
    });

    it('should update member', async () => {
      const response = await request(app)
        .put(`/api/members/${memberId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
          description: 'Updated description',
          isActive: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.member.name).toBe('Updated Name');
      expect(response.body.member.description).toBe('Updated description');
      expect(response.body.member.isActive).toBe(true);
    });

    it('should return 404 for non-existent member', async () => {
      const response = await request(app)
        .put('/api/members/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated',
        });

      expect(response.status).toBe(404);
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .put(`/api/members/${memberId}`)
        .send({
          name: 'Updated',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/members/:id (Protected)', () => {
    let memberId: number;

    beforeEach(async () => {
      const member = await Member.create({
        name: 'To Delete',
        slug: 'to-delete',
        description: 'Description',
      });
      memberId = member.id;
    });

    it('should delete member', async () => {
      const response = await request(app)
        .delete(`/api/members/${memberId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted');

      // Verify member is deleted
      const deletedMember = await Member.findByPk(memberId);
      expect(deletedMember).toBeNull();
    });

    it('should return 404 for non-existent member', async () => {
      const response = await request(app)
        .delete('/api/members/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should reject request without token', async () => {
      const response = await request(app).delete(`/api/members/${memberId}`);

      expect(response.status).toBe(401);
    });
  });
});
