import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from '../controllers/quizController';

const router = Router();

// ==================== ADMIN ROUTES ====================
// Mounted at /api/quizzes - All require admin authentication

// GET /api/quizzes - List all quizzes
router.get('/', authenticateToken, requireAdmin, getQuizzes);

// GET /api/quizzes/:id - Get quiz with questions and options
router.get('/:id', authenticateToken, requireAdmin, getQuizById);

// POST /api/quizzes - Create quiz
router.post('/', authenticateToken, requireAdmin, createQuiz);

// PUT /api/quizzes/:id - Update quiz
router.put('/:id', authenticateToken, requireAdmin, updateQuiz);

// DELETE /api/quizzes/:id - Delete quiz
router.delete('/:id', authenticateToken, requireAdmin, deleteQuiz);

// POST /api/quizzes/:quizId/questions - Add question to quiz
router.post('/:quizId/questions', authenticateToken, requireAdmin, addQuestion);

// PUT /api/quizzes/questions/:id - Update question
router.put('/questions/:id', authenticateToken, requireAdmin, updateQuestion);

// DELETE /api/quizzes/questions/:id - Delete question
router.delete('/questions/:id', authenticateToken, requireAdmin, deleteQuestion);

export default router;
