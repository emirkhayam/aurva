import { Router } from 'express';
import {
  getPartners,
  getPartnerBySlug,
  createPartner,
  updatePartner,
  deletePartner,
  validatePartner
} from '../controllers/partnerController';
import { authenticateToken, requireAdminOrModerator } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

/**
 * @swagger
 * /partners:
 *   get:
 *     summary: Получить список партнеров
 *     tags: [Partners]
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
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Фильтр по активности
 *     responses:
 *       200:
 *         description: Список партнеров
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
 *                     $ref: '#/components/schemas/Partner'
 */
router.get('/', getPartners);

/**
 * @swagger
 * /partners/{slug}:
 *   get:
 *     summary: Получить партнера по slug
 *     tags: [Partners]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug партнера
 *     responses:
 *       200:
 *         description: Данные партнера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Partner'
 *       404:
 *         description: Партнер не найден
 */
router.get('/:slug', getPartnerBySlug);

/**
 * @swagger
 * /partners:
 *   post:
 *     summary: Создать партнера
 *     tags: [Partners]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               website:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               displayOrder:
 *                 type: integer
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Партнер создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Partner'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав доступа
 */
router.post(
  '/',
  authenticateToken,
  requireAdminOrModerator,
  upload.single('logo'),
  validatePartner,
  createPartner
);

/**
 * @swagger
 * /partners/{id}:
 *   put:
 *     summary: Обновить партнера
 *     tags: [Partners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID партнера
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               website:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               displayOrder:
 *                 type: integer
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Партнер обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Partner'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Партнер не найден
 */
router.put(
  '/:id',
  authenticateToken,
  requireAdminOrModerator,
  upload.single('logo'),
  updatePartner
);

/**
 * @swagger
 * /partners/{id}:
 *   delete:
 *     summary: Удалить партнера
 *     tags: [Partners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID партнера
 *     responses:
 *       200:
 *         description: Партнер удален
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Партнер не найден
 */
router.delete('/:id', authenticateToken, requireAdminOrModerator, deletePartner);

export default router;
