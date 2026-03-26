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
 * @route   GET /api/admin/cabinet/stats
 * @desc    Get dashboard stats (total clients, courses, lessons, etc)
 * @access  Private (Admin/Moderator)
 */
router.get('/stats', getStats);

// ==================== CLIENTS ====================

/**
 * @route   GET /api/admin/cabinet/clients
 * @desc    List all client_profiles with search and pagination
 * @access  Private (Admin/Moderator)
 */
router.get('/clients', getClients);

/**
 * @route   GET /api/admin/cabinet/clients/:id
 * @desc    Get client by id
 * @access  Private (Admin/Moderator)
 */
router.get('/clients/:id', getClientById);

/**
 * @route   PUT /api/admin/cabinet/clients/:id
 * @desc    Update client (is_active, etc)
 * @access  Private (Admin/Moderator)
 */
router.put('/clients/:id', updateClient);

/**
 * @route   DELETE /api/admin/cabinet/clients/:id
 * @desc    Delete client
 * @access  Private (Admin/Moderator)
 */
router.delete('/clients/:id', deleteClient);

// ==================== COURSES ====================

/**
 * @route   GET /api/admin/cabinet/courses
 * @desc    List all courses (including unpublished)
 * @access  Private (Admin/Moderator)
 */
router.get('/courses', getCourses);

/**
 * @route   POST /api/admin/cabinet/courses
 * @desc    Create course
 * @access  Private (Admin/Moderator)
 */
router.post('/courses', createCourse);

/**
 * @route   GET /api/admin/cabinet/courses/:id
 * @desc    Get course by id
 * @access  Private (Admin/Moderator)
 */
router.get('/courses/:id', getCourseById);

/**
 * @route   PUT /api/admin/cabinet/courses/:id
 * @desc    Update course
 * @access  Private (Admin/Moderator)
 */
router.put('/courses/:id', updateCourse);

/**
 * @route   DELETE /api/admin/cabinet/courses/:id
 * @desc    Delete course
 * @access  Private (Admin/Moderator)
 */
router.delete('/courses/:id', deleteCourse);

// ==================== LESSONS ====================

/**
 * @route   GET /api/admin/cabinet/courses/:id/lessons
 * @desc    Get lessons for course
 * @access  Private (Admin/Moderator)
 */
router.get('/courses/:id/lessons', getLessons);

/**
 * @route   POST /api/admin/cabinet/courses/:id/lessons
 * @desc    Create lesson for course
 * @access  Private (Admin/Moderator)
 */
router.post('/courses/:id/lessons', createLesson);

/**
 * @route   PUT /api/admin/cabinet/lessons/:id
 * @desc    Update lesson
 * @access  Private (Admin/Moderator)
 */
router.put('/lessons/:id', updateLesson);

/**
 * @route   DELETE /api/admin/cabinet/lessons/:id
 * @desc    Delete lesson
 * @access  Private (Admin/Moderator)
 */
router.delete('/lessons/:id', deleteLesson);

// ==================== USER COURSE MANAGEMENT ====================

/**
 * @route   POST /api/admin/cabinet/user-courses
 * @desc    Assign course to user
 * @access  Private (Admin/Moderator)
 */
router.post('/user-courses', assignCourseToUser);

/**
 * @route   DELETE /api/admin/cabinet/user-courses/:userId/:courseId
 * @desc    Unassign course from user
 * @access  Private (Admin/Moderator)
 */
router.delete('/user-courses/:userId/:courseId', unassignCourseFromUser);

/**
 * @route   GET /api/admin/cabinet/user-courses/:userId
 * @desc    Get all courses for specific user
 * @access  Private (Admin/Moderator)
 */
router.get('/user-courses/:userId', getUserCourses);

/**
 * @route   GET /api/admin/cabinet/users-with-courses
 * @desc    Get all users with their course counts
 * @access  Private (Admin/Moderator)
 */
router.get('/users-with-courses', getAllUsersWithCourses);

export default router;
