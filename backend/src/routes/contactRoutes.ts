import { Router } from 'express';
import {
  createContact,
  getContacts,
  updateContactStatus,
  deleteContact,
  validateContact
} from '../controllers/contactController';
import { authenticateToken, requireAdminOrModerator } from '../middleware/auth';
import { contactLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @route   POST /api/contacts
 * @desc    Submit a contact form (public)
 * @access  Public
 */
router.post('/', contactLimiter, validateContact, createContact);

/**
 * @route   GET /api/contacts
 * @desc    Get all contacts with pagination
 * @access  Private (Admin/Moderator)
 */
router.get('/', authenticateToken, requireAdminOrModerator, getContacts);

/**
 * @route   PUT /api/contacts/:id
 * @desc    Update contact status and notes
 * @access  Private (Admin/Moderator)
 */
router.put('/:id', authenticateToken, requireAdminOrModerator, updateContactStatus);

/**
 * @route   DELETE /api/contacts/:id
 * @desc    Delete a contact
 * @access  Private (Admin/Moderator)
 */
router.delete('/:id', authenticateToken, requireAdminOrModerator, deleteContact);

export default router;
