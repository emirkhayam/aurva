import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  getCourses,
  getCourseBySlug,
  getUserProgress,
} from '../controllers/cabinetController';
import { authenticateClient, optionalAuthClient } from '../middleware/cabinetAuth';
import { authLimiter, apiLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @swagger
 * /cabinet/auth/register:
 *   post:
 *     summary: Регистрация клиента
 *     tags: [Cabinet - Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - full_name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               full_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               company_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Клиент зарегистрирован
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Ошибка валидации
 *       429:
 *         description: Слишком много запросов
 */
router.post('/auth/register', authLimiter, register);

/**
 * @swagger
 * /cabinet/auth/login:
 *   post:
 *     summary: Авторизация клиента
 *     tags: [Cabinet - Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успешная авторизация
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Неверные учетные данные
 */
router.post('/auth/login', authLimiter, login);

/**
 * @swagger
 * /cabinet/auth/refresh:
 *   post:
 *     summary: Обновить токен клиента
 *     tags: [Cabinet - Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Новый access token
 *       401:
 *         description: Невалидный refresh token
 */
router.post('/auth/refresh', refreshToken);

/**
 * @swagger
 * /cabinet/profile:
 *   get:
 *     summary: Получить профиль клиента
 *     tags: [Cabinet - Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные профиля
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ClientProfile'
 *       401:
 *         description: Не авторизован
 */
router.get('/profile', authenticateClient, getProfile);

/**
 * @swagger
 * /cabinet/profile:
 *   put:
 *     summary: Обновить профиль клиента
 *     tags: [Cabinet - Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               company_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Профиль обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ClientProfile'
 *       401:
 *         description: Не авторизован
 */
router.put('/profile', authenticateClient, updateProfile);

/**
 * @swagger
 * /cabinet/change-password:
 *   put:
 *     summary: Изменить пароль клиента
 *     tags: [Cabinet - Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Пароль изменен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Не авторизован или неверный пароль
 */
router.put('/change-password', authenticateClient, changePassword);

/**
 * @swagger
 * /cabinet/courses:
 *   get:
 *     summary: Получить доступные курсы
 *     tags: [Cabinet - Courses]
 *     responses:
 *       200:
 *         description: Список курсов
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
 *                     $ref: '#/components/schemas/Course'
 */
router.get('/courses', apiLimiter, optionalAuthClient, getCourses);

/**
 * @swagger
 * /cabinet/courses/{slug}:
 *   get:
 *     summary: Получить курс по slug
 *     tags: [Cabinet - Courses]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug курса
 *     responses:
 *       200:
 *         description: Данные курса с уроками
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 *       404:
 *         description: Курс не найден
 */
router.get('/courses/:slug', apiLimiter, getCourseBySlug);

/**
 * @swagger
 * /cabinet/progress:
 *   get:
 *     summary: Получить прогресс пользователя
 *     tags: [Cabinet - Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Прогресс по курсам
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
 *                     type: object
 *       401:
 *         description: Не авторизован
 */
router.get('/progress', authenticateClient, getUserProgress);

export default router;
