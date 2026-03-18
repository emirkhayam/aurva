import { Router } from 'express';
import {
  getMembers,
  getMemberBySlug,
  createMember,
  updateMember,
  deleteMember,
  validateMember
} from '../controllers/memberController';
import { authenticateToken, requireAdminOrModerator } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

/**
 * @route   GET /api/members
 * @desc    Get all members with pagination and filters
 * @access  Public
 */
router.get('/', getMembers);

/**
 * @route   GET /api/members/:slug
 * @desc    Get member by slug
 * @access  Public
 */
router.get('/:slug', getMemberBySlug);

/**
 * @route   POST /api/members
 * @desc    Create new member
 * @access  Private (Admin/Moderator)
 */
router.post(
  '/',
  authenticateToken,
  requireAdminOrModerator,
  upload.single('logo'),
  validateMember,
  createMember
);

/**
 * @route   PUT /api/members/:id
 * @desc    Update member
 * @access  Private (Admin/Moderator)
 */
router.put(
  '/:id',
  authenticateToken,
  requireAdminOrModerator,
  upload.single('logo'),
  updateMember
);

/**
 * @route   DELETE /api/members/:id
 * @desc    Delete member
 * @access  Private (Admin/Moderator)
 */
router.delete('/:id', authenticateToken, requireAdminOrModerator, deleteMember);

export default router;
