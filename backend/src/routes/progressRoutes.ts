import { Router } from 'express';
import { authenticateClient } from '../middleware/cabinetAuth';
import {
  markLessonComplete,
  markLessonIncomplete,
  getLessonProgress,
  updateWatchPosition,
} from '../controllers/progressController';

const router = Router();

// POST /api/cabinet/progress/lessons/:lessonId/complete - Mark lesson complete
router.post('/lessons/:lessonId/complete', authenticateClient, markLessonComplete);

// DELETE /api/cabinet/progress/lessons/:lessonId/complete - Unmark lesson complete
router.delete('/lessons/:lessonId/complete', authenticateClient, markLessonIncomplete);

// GET /api/cabinet/progress/courses/:courseId/lessons - Get progress for course lessons
router.get('/courses/:courseId/lessons', authenticateClient, getLessonProgress);

// PUT /api/cabinet/progress/lessons/:lessonId/position - Update watch position
router.put('/lessons/:lessonId/position', authenticateClient, updateWatchPosition);

export default router;
