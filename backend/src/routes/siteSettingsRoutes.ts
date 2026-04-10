import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/siteSettingsController';
import { authenticateToken, requireAdminOrModerator } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Получить настройки сайта
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Настройки сайта
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       500:
 *         description: Ошибка сервера
 */
router.get('/', getSettings);

/**
 * @swagger
 * /settings:
 *   put:
 *     summary: Обновить настройки сайта
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Настройки обновлены
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав доступа
 */
router.put('/', authenticateToken, requireAdminOrModerator, updateSettings);

export default router;
