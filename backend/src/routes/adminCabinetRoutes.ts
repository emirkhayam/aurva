import { Router } from 'express';
import {
  getClients,
  getClientById,
  updateClient,
  deleteClient,
  getCourses,
  createCourse,
  getCourseById,
  updateCourse,
  deleteCourse,
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  getStats,
  assignCourseToUser,
  unassignCourseFromUser,
  getUserCourses,
  getAllUsersWithCourses,
} from '../controllers/adminCabinetController';
import { authenticateToken, requireAdminOrModerator } from '../middleware/auth';

const router = Router();

// All routes require authentication + admin/moderator role
router.use(authenticateToken, requireAdminOrModerator);

// ==================== STATS ====================

/**
 * @swagger
 * /admin/cabinet/stats:
 *   get:
 *     summary: Получить статистику кабинета
 *     tags: [Admin Cabinet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Статистика (клиенты, курсы, уроки)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalClients:
 *                       type: integer
 *                     totalCourses:
 *                       type: integer
 *                     totalLessons:
 *                       type: integer
 *       401:
 *         description: Не авторизован
 */
router.get('/stats', getStats);

// ==================== CLIENTS ====================

/**
 * @swagger
 * /admin/cabinet/clients:
 *   get:
 *     summary: Получить список клиентов
 *     tags: [Admin Cabinet - Clients]
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
 *         description: Количество записей
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Поиск по имени/email
 *     responses:
 *       200:
 *         description: Список клиентов
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
 *                     $ref: '#/components/schemas/ClientProfile'
 *       401:
 *         description: Не авторизован
 */
router.get('/clients', getClients);

/**
 * @swagger
 * /admin/cabinet/clients/{id}:
 *   get:
 *     summary: Получить клиента по ID
 *     tags: [Admin Cabinet - Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID клиента
 *     responses:
 *       200:
 *         description: Данные клиента
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ClientProfile'
 *       404:
 *         description: Клиент не найден
 */
router.get('/clients/:id', getClientById);

/**
 * @swagger
 * /admin/cabinet/clients/{id}:
 *   put:
 *     summary: Обновить клиента
 *     tags: [Admin Cabinet - Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID клиента
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_active:
 *                 type: boolean
 *               full_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               company_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Клиент обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ClientProfile'
 *       404:
 *         description: Клиент не найден
 */
router.put('/clients/:id', updateClient);

/**
 * @swagger
 * /admin/cabinet/clients/{id}:
 *   delete:
 *     summary: Удалить клиента
 *     tags: [Admin Cabinet - Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID клиента
 *     responses:
 *       200:
 *         description: Клиент удален
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Клиент не найден
 */
router.delete('/clients/:id', deleteClient);

// ==================== COURSES ====================

/**
 * @swagger
 * /admin/cabinet/courses:
 *   get:
 *     summary: Получить все курсы (включая неопубликованные)
 *     tags: [Admin Cabinet - Courses]
 *     security:
 *       - bearerAuth: []
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
router.get('/courses', getCourses);

/**
 * @swagger
 * /admin/cabinet/courses:
 *   post:
 *     summary: Создать курс
 *     tags: [Admin Cabinet - Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               image_url:
 *                 type: string
 *               is_published:
 *                 type: boolean
 *               display_order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Курс создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 */
router.post('/courses', createCourse);

/**
 * @swagger
 * /admin/cabinet/courses/{id}:
 *   get:
 *     summary: Получить курс по ID
 *     tags: [Admin Cabinet - Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID курса
 *     responses:
 *       200:
 *         description: Данные курса
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
router.get('/courses/:id', getCourseById);

/**
 * @swagger
 * /admin/cabinet/courses/{id}:
 *   put:
 *     summary: Обновить курс
 *     tags: [Admin Cabinet - Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID курса
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               image_url:
 *                 type: string
 *               is_published:
 *                 type: boolean
 *               display_order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Курс обновлен
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
router.put('/courses/:id', updateCourse);

/**
 * @swagger
 * /admin/cabinet/courses/{id}:
 *   delete:
 *     summary: Удалить курс
 *     tags: [Admin Cabinet - Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID курса
 *     responses:
 *       200:
 *         description: Курс удален
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Курс не найден
 */
router.delete('/courses/:id', deleteCourse);

// ==================== LESSONS ====================

/**
 * @swagger
 * /admin/cabinet/courses/{id}/lessons:
 *   get:
 *     summary: Получить уроки курса
 *     tags: [Admin Cabinet - Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID курса
 *     responses:
 *       200:
 *         description: Список уроков
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
 *                     $ref: '#/components/schemas/CourseLesson'
 */
router.get('/courses/:id/lessons', getLessons);

/**
 * @swagger
 * /admin/cabinet/courses/{id}/lessons:
 *   post:
 *     summary: Создать урок для курса
 *     tags: [Admin Cabinet - Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID курса
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               video_url:
 *                 type: string
 *               is_published:
 *                 type: boolean
 *               display_order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Урок создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CourseLesson'
 */
router.post('/courses/:id/lessons', createLesson);

/**
 * @swagger
 * /admin/cabinet/lessons/{id}:
 *   put:
 *     summary: Обновить урок
 *     tags: [Admin Cabinet - Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID урока
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               video_url:
 *                 type: string
 *               is_published:
 *                 type: boolean
 *               display_order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Урок обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CourseLesson'
 *       404:
 *         description: Урок не найден
 */
router.put('/lessons/:id', updateLesson);

/**
 * @swagger
 * /admin/cabinet/lessons/{id}:
 *   delete:
 *     summary: Удалить урок
 *     tags: [Admin Cabinet - Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID урока
 *     responses:
 *       200:
 *         description: Урок удален
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Урок не найден
 */
router.delete('/lessons/:id', deleteLesson);

// ==================== USER COURSE MANAGEMENT ====================

/**
 * @swagger
 * /admin/cabinet/user-courses:
 *   post:
 *     summary: Назначить курс пользователю
 *     tags: [Admin Cabinet - User Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - courseId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               courseId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Курс назначен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Курс уже назначен
 */
router.post('/user-courses', assignCourseToUser);

/**
 * @swagger
 * /admin/cabinet/user-courses/{userId}/{courseId}:
 *   delete:
 *     summary: Отменить назначение курса
 *     tags: [Admin Cabinet - User Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID пользователя
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID курса
 *     responses:
 *       200:
 *         description: Назначение отменено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Назначение не найдено
 */
router.delete('/user-courses/:userId/:courseId', unassignCourseFromUser);

/**
 * @swagger
 * /admin/cabinet/user-courses/{userId}:
 *   get:
 *     summary: Получить курсы пользователя
 *     tags: [Admin Cabinet - User Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Список курсов пользователя
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
router.get('/user-courses/:userId', getUserCourses);

/**
 * @swagger
 * /admin/cabinet/users-with-courses:
 *   get:
 *     summary: Получить пользователей с количеством курсов
 *     tags: [Admin Cabinet - User Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей с курсами
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
 *                     properties:
 *                       id:
 *                         type: string
 *                       full_name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       courseCount:
 *                         type: integer
 */
router.get('/users-with-courses', getAllUsersWithCourses);

export default router;
