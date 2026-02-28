import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Contact } from '../models';
import { sendContactNotification } from '../utils/email';

export const validateContact = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 255 }),
  body('phone').trim().notEmpty().withMessage('Phone is required').matches(/^[\d\s\+\-\(\)]+$/).withMessage('Invalid phone format'),
  body('email').optional().trim().isEmail().withMessage('Invalid email format').normalizeEmail()
];

export const createContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, phone, email } = req.body;

    // Get client IP and User-Agent for tracking
    const ip = req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Create contact
    const contact = await Contact.create({
      name,
      phone,
      email: email || null,
      ip,
      userAgent,
      status: 'new'
    });

    // Send email notification (non-blocking)
    sendContactNotification(name, phone, email).catch(err => {
      console.error('Failed to send email notification:', err);
    });

    res.status(201).json({
      message: 'Заявка успешно отправлена. Мы свяжемся с вами в ближайшее время.',
      contact: {
        id: contact.id,
        name: contact.name
      }
    });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getContacts = async (req: any, res: Response): Promise<void> => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { rows: contacts, count } = await Contact.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      contacts,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateContactStatus = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['new', 'contacted', 'processed', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const contact = await Contact.findByPk(id);

    if (!contact) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    if (status) contact.status = status;
    if (notes !== undefined) contact.notes = notes;

    await contact.save();

    res.json({ message: 'Contact updated successfully', contact });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteContact = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByPk(id);

    if (!contact) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    await contact.destroy();

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
