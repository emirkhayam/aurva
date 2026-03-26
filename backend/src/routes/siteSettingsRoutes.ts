import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/siteSettingsController';
import { authenticateToken, requireAdminOrModerator } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/settings
 * @desc    Get all site settings
 * @access  Public
 */
router.get('/', getSettings);

/**
 * @route   PUT /api/settings
 * @desc    Update site settings
 * @access  Private (Admin/Moderator)
 */
router.put('/', authenticateToken, requireAdminOrModerator, updateSettings);

export default router;
