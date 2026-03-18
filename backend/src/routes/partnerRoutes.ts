import { Router } from 'express';
import {
  getPartners,
  getPartnerBySlug,
  createPartner,
  updatePartner,
  deletePartner,
  validatePartner
} from '../controllers/partnerController';
import { authenticateToken, requireAdminOrModerator } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

/**
 * @route   GET /api/partners
 * @desc    Get all partners with pagination and filters
 * @access  Public
 */
router.get('/', getPartners);

/**
 * @route   GET /api/partners/:slug
 * @desc    Get partner by slug
 * @access  Public
 */
router.get('/:slug', getPartnerBySlug);

/**
 * @route   POST /api/partners
 * @desc    Create new partner
 * @access  Private (Admin/Moderator)
 */
router.post(
  '/',
  authenticateToken,
  requireAdminOrModerator,
  upload.single('logo'),
  validatePartner,
  createPartner
);

/**
 * @route   PUT /api/partners/:id
 * @desc    Update partner
 * @access  Private (Admin/Moderator)
 */
router.put(
  '/:id',
  authenticateToken,
  requireAdminOrModerator,
  upload.single('logo'),
  updatePartner
);

/**
 * @route   DELETE /api/partners/:id
 * @desc    Delete partner
 * @access  Private (Admin/Moderator)
 */
router.delete('/:id', authenticateToken, requireAdminOrModerator, deletePartner);

export default router;
