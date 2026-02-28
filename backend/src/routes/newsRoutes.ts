import { Router } from 'express';
import {
  getNews,
  getNewsBySlug,
  createNews,
  updateNews,
  deleteNews,
  validateNews
} from '../controllers/newsController';
import { authenticateToken, requireAdminOrModerator } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

/**
 * @route   GET /api/news
 * @desc    Get all news with pagination and filters
 * @access  Public
 */
router.get('/', getNews);

/**
 * @route   GET /api/news/:slug
 * @desc    Get news by slug
 * @access  Public
 */
router.get('/:slug', getNewsBySlug);

/**
 * @route   POST /api/news
 * @desc    Create new news article
 * @access  Private (Admin/Moderator)
 */
router.post(
  '/',
  authenticateToken,
  requireAdminOrModerator,
  upload.array('images', 10), // Support up to 10 images
  validateNews,
  createNews
);

/**
 * @route   PUT /api/news/:id
 * @desc    Update news article
 * @access  Private (Admin/Moderator)
 */
router.put(
  '/:id',
  authenticateToken,
  requireAdminOrModerator,
  upload.array('images', 10), // Support up to 10 images
  updateNews
);

/**
 * @route   DELETE /api/news/:id
 * @desc    Delete news article
 * @access  Private (Admin/Moderator)
 */
router.delete('/:id', authenticateToken, requireAdminOrModerator, deleteNews);

export default router;
