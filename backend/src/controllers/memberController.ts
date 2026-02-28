import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Member } from '../models';
import fs from 'fs';
import path from 'path';

export const validateMember = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 255 }),
  body('website').optional().isURL().withMessage('Invalid URL format'),
  body('displayOrder').optional().isInt({ min: 0 })
];

export const getMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isActive, page = 1, limit = 50 } = req.query;

    const where: any = {};
    // By default, show only active members for public endpoint
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    } else {
      where.isActive = true; // Default: only active
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const { rows: members, count } = await Member.findAndCountAll({
      where,
      limit: parseInt(limit as string),
      offset,
      order: [['displayOrder', 'ASC'], ['name', 'ASC']]
    });

    res.json({
      members,
      pagination: {
        total: count,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(count / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMemberBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const member = await Member.findOne({ where: { slug } });

    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    res.json({ member });
  } catch (error) {
    console.error('Get member by slug error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createMember = async (req: any, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, slug, description, website, isActive, displayOrder, joinedDate } = req.body;

    let logoUrl = undefined;
    if (req.file) {
      logoUrl = `/uploads/logos/${req.file.filename}`;
    }

    const member = await Member.create({
      name,
      slug: slug || undefined, // Auto-generate if not provided (beforeCreate hook)
      description,
      website,
      logoUrl,
      isActive: isActive === 'true' || isActive === true || isActive === undefined,
      displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      joinedDate: joinedDate ? new Date(joinedDate) : undefined
    });

    res.status(201).json({ message: 'Member created successfully', member });
  } catch (error) {
    console.error('Create member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMember = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, website, isActive, displayOrder, joinedDate } = req.body;

    const member = await Member.findByPk(id);

    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    // Update fields
    if (name) member.name = name;
    if (description !== undefined) member.description = description;
    if (website !== undefined) member.website = website;
    if (isActive !== undefined) member.isActive = isActive === 'true' || isActive === true;
    if (displayOrder !== undefined) member.displayOrder = parseInt(displayOrder);
    if (joinedDate !== undefined) member.joinedDate = joinedDate ? new Date(joinedDate) : undefined;

    // Handle logo upload
    if (req.file) {
      // Delete old logo if exists
      if (member.logoUrl) {
        const oldLogoPath = path.join(process.cwd(), member.logoUrl);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
      member.logoUrl = `/uploads/logos/${req.file.filename}`;
    }

    await member.save();

    res.json({ message: 'Member updated successfully', member });
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteMember = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const member = await Member.findByPk(id);

    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    // Delete logo if exists
    if (member.logoUrl) {
      const logoPath = path.join(process.cwd(), member.logoUrl);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }

    await member.destroy();

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
