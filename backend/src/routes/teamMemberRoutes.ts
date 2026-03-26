import { Router } from 'express';
import {
  getTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  validateTeamMember
} from '../controllers/teamMemberController';
import { authenticateToken, requireAdminOrModerator } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

/**
 * @route   GET /api/team
 * @desc    Get all team members with pagination and filters
 * @access  Public
 */
router.get('/', getTeamMembers);

/**
 * @route   GET /api/team/:id
 * @desc    Get team member by ID
 * @access  Public
 */
router.get('/:id', getTeamMemberById);

/**
 * @route   POST /api/team
 * @desc    Create new team member
 * @access  Private (Admin/Moderator)
 */
router.post(
  '/',
  authenticateToken,
  requireAdminOrModerator,
  upload.single('photo'),
  validateTeamMember,
  createTeamMember
);

/**
 * @route   PUT /api/team/:id
 * @desc    Update team member
 * @access  Private (Admin/Moderator)
 */
router.put(
  '/:id',
  authenticateToken,
  requireAdminOrModerator,
  upload.single('photo'),
  updateTeamMember
);

/**
 * @route   DELETE /api/team/:id
 * @desc    Delete team member
 * @access  Private (Admin/Moderator)
 */
router.delete('/:id', authenticateToken, requireAdminOrModerator, deleteTeamMember);

export default router;
