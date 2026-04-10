import { Router } from 'express';
import {
  getMembers,
  getMemberBySlug,
  createMember,
  updateMember,
  deleteMember,
  validateMember
} from '../controllers/memberController';
import { authenticateToken, requireAdminOrModerator } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

/**
 * @swagger
 * /members:
 *   get:
 *     summary: Получить список участников
 *     tags: [Members]
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
 *         description: Список участников
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
 *                     $ref: '#/components/schemas/Member'
 */
router.get('/', getMembers);

/**
 * @swagger
 * /members/{slug}:
 *   get:
 *     summary: Получить участника по slug
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug участника
 *     responses:
 *       200:
 *         description: Данные участника
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Member'
 *       404:
 *         description: Участник не найден
 */
router.get('/:slug', getMemberBySlug);

/**
 * @swagger
 * /members:
 *   post:
 *     summary: Создать участника
 *     tags: [Members]
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
 *               description:
 *                 type: string
 *               website:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               displayOrder:
 *                 type: integer
 *               joinedDate:
 *                 type: string
 *                 format: date
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Участник создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Member'
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
  validateMember,
  createMember
);

/**
 * @swagger
 * /members/{id}:
 *   put:
 *     summary: Обновить участника
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID участника
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
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
 *         description: Участник обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Member'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Участник не найден
 */
router.put(
  '/:id',
  authenticateToken,
  requireAdminOrModerator,
  upload.single('logo'),
  updateMember
);

/**
 * @swagger
 * /members/{id}:
 *   delete:
 *     summary: Удалить участника
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID участника
 *     responses:
 *       200:
 *         description: Участник удален
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Участник не найден
 */
router.delete('/:id', authenticateToken, requireAdminOrModerator, deleteMember);

export default router;
