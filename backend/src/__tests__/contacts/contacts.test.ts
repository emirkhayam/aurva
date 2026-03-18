import request from 'supertest';
import { Application } from 'express';
import { setupTestApp, teardownTestApp } from '../helpers/testApp';
import Contact from '../../models/Contact';
import User from '../../models/User';

describe('Contacts API', () => {
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
    // Clear contacts before each test
    await Contact.destroy({ where: {} });
  });

  describe('POST /api/contacts (Public)', () => {
    it('should create contact with name and phone', async () => {
      const response = await request(app)
        .post('/api/contacts')
        .send({
          name: 'Иван Иванов',
          phone: '+996 555 123 456',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body.contact).toHaveProperty('id');
      expect(response.body.contact.name).toBe('Иван Иванов');
    });

    it('should create contact with name, phone and email', async () => {
      const response = await request(app)
        .post('/api/contacts')
        .send({
          name: 'Петр Петров',
          phone: '+996 555 987 654',
          email: 'petr@example.com',
        });

      expect(response.status).toBe(201);
      expect(response.body.contact).toHaveProperty('id');
    });

    it('should reject contact without name', async () => {
      const response = await request(app)
        .post('/api/contacts')
        .send({
          phone: '+996 555 123 456',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should reject contact without phone', async () => {
      const response = await request(app)
        .post('/api/contacts')
        .send({
          name: 'Тест',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should reject contact with invalid email', async () => {
      const response = await request(app)
        .post('/api/contacts')
        .send({
          name: 'Тест',
          phone: '+996 555 123 456',
          email: 'invalid-email',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should reject contact with invalid phone format', async () => {
      const response = await request(app)
        .post('/api/contacts')
        .send({
          name: 'Тест',
          phone: 'abc123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/contacts (Protected)', () => {
    beforeEach(async () => {
      // Create test contacts
      await Contact.create({
        name: 'Contact 1',
        phone: '+996 555 111 111',
        status: 'new',
      });
      await Contact.create({
        name: 'Contact 2',
        phone: '+996 555 222 222',
        status: 'contacted',
      });
      await Contact.create({
        name: 'Contact 3',
        phone: '+996 555 333 333',
        status: 'processed',
      });
    });

    it('should get all contacts with valid token', async () => {
      const response = await request(app)
        .get('/api/contacts')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('contacts');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.contacts).toHaveLength(3);
    });

    it('should filter contacts by status', async () => {
      const response = await request(app)
        .get('/api/contacts?status=new')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.contacts).toHaveLength(1);
      expect(response.body.contacts[0].status).toBe('new');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/contacts?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.contacts).toHaveLength(2);
      expect(response.body.pagination.total).toBe(3);
      expect(response.body.pagination.pages).toBe(2);
    });

    it('should reject request without token', async () => {
      const response = await request(app).get('/api/contacts');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/contacts/:id (Protected)', () => {
    let contactId: number;

    beforeEach(async () => {
      const contact = await Contact.create({
        name: 'Test Contact',
        phone: '+996 555 123 456',
        status: 'new',
      });
      contactId = contact.id;
    });

    it('should update contact status', async () => {
      const response = await request(app)
        .put(`/api/contacts/${contactId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'contacted',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('updated');
      expect(response.body.contact.status).toBe('contacted');
    });

    it('should update contact notes', async () => {
      const response = await request(app)
        .put(`/api/contacts/${contactId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          notes: 'Позвонил, договорились на встречу',
        });

      expect(response.status).toBe(200);
      expect(response.body.contact.notes).toBe('Позвонил, договорились на встречу');
    });

    it('should reject invalid status', async () => {
      const response = await request(app)
        .put(`/api/contacts/${contactId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'invalid_status',
        });

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent contact', async () => {
      const response = await request(app)
        .put('/api/contacts/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'contacted',
        });

      expect(response.status).toBe(404);
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .put(`/api/contacts/${contactId}`)
        .send({
          status: 'contacted',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/contacts/:id (Protected)', () => {
    let contactId: number;

    beforeEach(async () => {
      const contact = await Contact.create({
        name: 'Test Contact',
        phone: '+996 555 123 456',
        status: 'new',
      });
      contactId = contact.id;
    });

    it('should delete contact', async () => {
      const response = await request(app)
        .delete(`/api/contacts/${contactId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted');

      // Verify contact is deleted
      const deletedContact = await Contact.findByPk(contactId);
      expect(deletedContact).toBeNull();
    });

    it('should return 404 for non-existent contact', async () => {
      const response = await request(app)
        .delete('/api/contacts/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should reject request without token', async () => {
      const response = await request(app).delete(`/api/contacts/${contactId}`);

      expect(response.status).toBe(401);
    });
  });
});
