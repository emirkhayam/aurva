import request from 'supertest';
import { Application } from 'express';
import { setupTestApp, teardownTestApp } from '../helpers/testApp';
import News from '../../models/News';
import User from '../../models/User';

describe('News API', () => {
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
    // Clear news before each test
    await News.destroy({ where: {} });
  });

  describe('GET /api/news (Public)', () => {
    beforeEach(async () => {
      // Create test news
      await News.create({
        title: 'News 1',
        slug: 'news-1',
        content: 'Content 1',
        excerpt: 'Excerpt 1',
        published: true,
        publishedAt: new Date(),
      });
      await News.create({
        title: 'News 2',
        slug: 'news-2',
        content: 'Content 2',
        excerpt: 'Excerpt 2',
        published: true,
        publishedAt: new Date(),
      });
      await News.create({
        title: 'Unpublished News',
        slug: 'unpublished',
        content: 'Content 3',
        excerpt: 'Excerpt 3',
        published: false,
      });
    });

    it('should get all published news', async () => {
      const response = await request(app).get('/api/news');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('news');
      expect(response.body.news.length).toBe(2); // Only published
    });

    it('should support pagination', async () => {
      const response = await request(app).get('/api/news?page=1&limit=1');

      expect(response.status).toBe(200);
      expect(response.body.news).toHaveLength(1);
      expect(response.body.pagination.total).toBe(2);
    });
  });

  describe('GET /api/news/:slug (Public)', () => {
    beforeEach(async () => {
      await News.create({
        title: 'Test News',
        slug: 'test-news',
        content: 'Test content',
        excerpt: 'Test excerpt',
        published: true,
        publishedAt: new Date(),
      });
    });

    it('should get news by slug', async () => {
      const response = await request(app).get('/api/news/test-news');

      expect(response.status).toBe(200);
      expect(response.body.news.slug).toBe('test-news');
      expect(response.body.news.title).toBe('Test News');
    });

    it('should return 404 for non-existent slug', async () => {
      const response = await request(app).get('/api/news/non-existent');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/news (Protected)', () => {
    it('should create news with valid data', async () => {
      const response = await request(app)
        .post('/api/news')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'New Article',
          slug: 'new-article',
          content: 'Article content',
          excerpt: 'Article excerpt',
          published: true,
        });

      expect(response.status).toBe(201);
      expect(response.body.news.title).toBe('New Article');
      expect(response.body.news.slug).toBe('new-article');
    });

    it('should auto-generate slug from title if not provided', async () => {
      const response = await request(app)
        .post('/api/news')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Article Title',
          content: 'Content',
          excerpt: 'Excerpt',
        });

      expect(response.status).toBe(201);
      expect(response.body.news.slug).toMatch(/test-article-title/);
    });

    it('should reject news without title', async () => {
      const response = await request(app)
        .post('/api/news')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Content',
          excerpt: 'Excerpt',
        });

      expect(response.status).toBe(400);
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .post('/api/news')
        .send({
          title: 'Test',
          content: 'Content',
          excerpt: 'Excerpt',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/news/:id (Protected)', () => {
    let newsId: number;

    beforeEach(async () => {
      const news = await News.create({
        title: 'Original Title',
        slug: 'original-slug',
        content: 'Original content',
        excerpt: 'Original excerpt',
        published: false,
      });
      newsId = news.id;
    });

    it('should update news', async () => {
      const response = await request(app)
        .put(`/api/news/${newsId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Title',
          content: 'Updated content',
          published: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.news.title).toBe('Updated Title');
      expect(response.body.news.content).toBe('Updated content');
      expect(response.body.news.published).toBe(true);
    });

    it('should return 404 for non-existent news', async () => {
      const response = await request(app)
        .put('/api/news/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated',
        });

      expect(response.status).toBe(404);
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .put(`/api/news/${newsId}`)
        .send({
          title: 'Updated',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/news/:id (Protected)', () => {
    let newsId: number;

    beforeEach(async () => {
      const news = await News.create({
        title: 'To Delete',
        slug: 'to-delete',
        content: 'Content',
        excerpt: 'Excerpt',
      });
      newsId = news.id;
    });

    it('should delete news', async () => {
      const response = await request(app)
        .delete(`/api/news/${newsId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted');

      // Verify news is deleted
      const deletedNews = await News.findByPk(newsId);
      expect(deletedNews).toBeNull();
    });

    it('should return 404 for non-existent news', async () => {
      const response = await request(app)
        .delete('/api/news/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should reject request without token', async () => {
      const response = await request(app).delete(`/api/news/${newsId}`);

      expect(response.status).toBe(401);
    });
  });
});
