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
import { authenticateClient } from '../middleware/cabinetAuth';
import { authLimiter, apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Auth
router.post('/auth/register', authLimiter, register);
router.post('/auth/login', authLimiter, login);
router.post('/auth/refresh', refreshToken);

// Profile (protected)
router.get('/profile', authenticateClient, getProfile);
router.put('/profile', authenticateClient, updateProfile);
router.put('/change-password', authenticateClient, changePassword);

// Courses (public listing, progress is protected)
router.get('/courses', apiLimiter, getCourses);
router.get('/courses/:slug', apiLimiter, getCourseBySlug);
router.get('/progress', authenticateClient, getUserProgress);

export default router;
