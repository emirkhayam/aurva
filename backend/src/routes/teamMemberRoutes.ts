import { Router } from 'express';
import {
  getTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  validateTeamMember
} from '../controllers/teamMemberController';
import { authenticateToken, requireAdminOrModerator } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

/**
 * @swagger
 * /team:
 *   get:
 *     summary: Получить список членов команды
 *     tags: [Team]
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
 *           enum: [leadership, council, other]
 *         description: Фильтр по категории
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Фильтр по активности
 *     responses:
 *       200:
 *         description: Список членов команды
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
 *                     $ref: '#/components/schemas/TeamMember'
 */
router.get('/', getTeamMembers);

/**
 * @swagger
 * /team/{id}:
 *   get:
 *     summary: Получить члена команды по ID
 *     tags: [Team]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID члена команды
 *     responses:
 *       200:
 *         description: Данные члена команды
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TeamMember'
 *       404:
 *         description: Член команды не найден
 */
router.get('/:id', getTeamMemberById);

/**
 * @swagger
 * /team:
 *   post:
 *     summary: Создать члена команды
 *     tags: [Team]
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
 *               - position
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               position:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [leadership, council, other]
 *               is_active:
 *                 type: boolean
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Член команды создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TeamMember'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав доступа
 */
router.post(
  '/',
  authenticateToken,
  requireAdminOrModerator,
  upload.single('photo'),
  validateTeamMember,
  createTeamMember
);

/**
 * @swagger
 * /team/{id}:
 *   put:
 *     summary: Обновить члена команды
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID члена команды
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               position:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [leadership, council, other]
 *               is_active:
 *                 type: boolean
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Член команды обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TeamMember'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Член команды не найден
 */
router.put(
  '/:id',
  authenticateToken,
  requireAdminOrModerator,
  upload.single('photo'),
  updateTeamMember
);

/**
 * @swagger
 * /team/{id}:
 *   delete:
 *     summary: Удалить члена команды
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID члена команды
 *     responses:
 *       200:
 *         description: Член команды удален
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Член команды не найден
 */
router.delete('/:id', authenticateToken, requireAdminOrModerator, deleteTeamMember);

export default router;
