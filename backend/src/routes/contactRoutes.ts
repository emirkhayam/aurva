import { Router } from 'express';
import {
  createContact,
  getContacts,
  updateContactStatus,
  deleteContact,
  validateContact
} from '../controllers/contactController';
import { authenticateToken, requireAdminOrModerator } from '../middleware/auth';
import { contactLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @swagger
 * /contacts:
 *   post:
 *     summary: Отправить контактную форму
 *     tags: [Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Заявка отправлена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *       429:
 *         description: Слишком много запросов
 */
router.post('/', contactLimiter, validateContact, createContact);

/**
 * @swagger
 * /contacts:
 *   get:
 *     summary: Получить список заявок
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, contacted, processed, rejected]
 *         description: Фильтр по статусу
 *     responses:
 *       200:
 *         description: Список заявок
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
 *                     $ref: '#/components/schemas/Contact'
 *       401:
 *         description: Не авторизован
 */
router.get('/', authenticateToken, requireAdminOrModerator, getContacts);

/**
 * @swagger
 * /contacts/{id}:
 *   put:
 *     summary: Обновить статус заявки
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID заявки
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [new, contacted, processed, rejected]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Статус обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Заявка не найдена
 */
router.put('/:id', authenticateToken, requireAdminOrModerator, updateContactStatus);

/**
 * @swagger
 * /contacts/{id}:
 *   delete:
 *     summary: Удалить заявку
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID заявки
 *     responses:
 *       200:
 *         description: Заявка удалена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Заявка не найдена
 */
router.delete('/:id', authenticateToken, requireAdminOrModerator, deleteContact);

export default router;
