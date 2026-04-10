import { Router } from 'express';
import {
  getNews,
  getNewsBySlug,
  createNews,
  updateNews,
  deleteNews,
  validateNews
} from '../controllers/newsController';
import { authenticateToken, requireAdminOrModerator } from '../middleware/auth';
import upload from '../middleware/upload';
import { optimizeImages } from '../middleware/imageOptimizer';
import { uploadMultipleToSupabase } from '../middleware/supabaseUpload';

const router = Router();

/**
 * @swagger
 * /news:
 *   get:
 *     summary: Получить список новостей
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Количество записей на страницу
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [regulation, events, analytics, other]
 *         description: Фильтр по категории
 *       - in: query
 *         name: published
 *         schema:
 *           type: boolean
 *         description: Фильтр по статусу публикации
 *     responses:
 *       200:
 *         description: Список новостей с пагинацией
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/News'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 */
router.get('/', getNews);

/**
 * @swagger
 * /news/{slug}:
 *   get:
 *     summary: Получить новость по slug
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug новости
 *     responses:
 *       200:
 *         description: Данные новости
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/News'
 *       404:
 *         description: Новость не найдена
 */
router.get('/:slug', getNewsBySlug);

/**
 * @swagger
 * /news:
 *   post:
 *     summary: Создать новость
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [regulation, events, analytics, other]
 *               published:
 *                 type: boolean
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Новость создана
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/News'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав доступа
 */
router.post(
  '/',
  authenticateToken,
  requireAdminOrModerator,
  upload.array('images', 10),
  optimizeImages,
  uploadMultipleToSupabase('news'),
  validateNews,
  createNews
);

/**
 * @swagger
 * /news/{id}:
 *   put:
 *     summary: Обновить новость
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID новости
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [regulation, events, analytics, other]
 *               published:
 *                 type: boolean
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Новость обновлена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/News'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Новость не найдена
 */
router.put(
  '/:id',
  authenticateToken,
  requireAdminOrModerator,
  upload.array('images', 10),
  optimizeImages,
  uploadMultipleToSupabase('news'),
  updateNews
);

/**
 * @swagger
 * /news/{id}:
 *   delete:
 *     summary: Удалить новость
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID новости
 *     responses:
 *       200:
 *         description: Новость удалена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Новость не найдена
 */
router.delete('/:id', authenticateToken, requireAdminOrModerator, deleteNews);

export default router;
