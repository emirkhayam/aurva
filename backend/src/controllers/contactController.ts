import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { getSupabaseClient } from '../config/supabase';
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

    const supabase = getSupabaseClient();

    // Create contact
    const { data: contact, error } = await supabase
      .from('contacts')
      .insert({
        name,
        phone,
        email: email || null,
        ip,
        user_agent: userAgent,
        status: 'new'
      })
      .select()
      .single();

    if (error) {
      console.error('Create contact error:', error);
      res.status(500).json({ error: 'Failed to create contact' });
      return;
    }

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
    const supabase = getSupabaseClient();

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('contacts')
      .select('*', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: contacts, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) {
      console.error('Get contacts error:', error);
      res.status(500).json({ error: 'Failed to fetch contacts' });
      return;
    }

    res.json({
      contacts: contacts || [],
      pagination: {
        total: count || 0,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil((count || 0) / limitNum)
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
    const supabase = getSupabaseClient();

    const validStatuses = ['new', 'contacted', 'processed', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    // Check if contact exists
    const { data: existing, error: fetchError } = await supabase
      .from('contacts')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    // Prepare update data
    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const { data: contact, error } = await supabase
      .from('contacts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update contact error:', error);
      res.status(500).json({ error: 'Failed to update contact' });
      return;
    }

    res.json({ message: 'Contact updated successfully', contact });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteContact = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();

    // Check if contact exists
    const { data: existing, error: fetchError } = await supabase
      .from('contacts')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete contact error:', error);
      res.status(500).json({ error: 'Failed to delete contact' });
      return;
    }

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
