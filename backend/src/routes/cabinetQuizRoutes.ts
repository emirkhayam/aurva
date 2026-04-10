import { Router } from 'express';
import { authenticateClient } from '../middleware/cabinetAuth';
import {
  getQuizForLesson,
  submitQuizAttempt,
  getMyAttempts,
} from '../controllers/quizController';

const router = Router();

// ==================== CLIENT ROUTES ====================
// Mounted at /api/cabinet/quizzes

// GET /api/cabinet/quizzes/lesson/:lessonId - Get quiz for lesson
router.get('/lesson/:lessonId', authenticateClient, getQuizForLesson);

// GET /api/cabinet/quizzes/my-attempts - Get my attempts
router.get('/my-attempts', authenticateClient, getMyAttempts);

// POST /api/cabinet/quizzes/:quizId/submit - Submit quiz attempt
router.post('/:quizId/submit', authenticateClient, submitQuizAttempt);

export default router;
