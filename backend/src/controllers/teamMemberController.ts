import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { TeamMember } from '../models';
import fs from 'fs';
import path from 'path';

export const validateTeamMember = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 255 }),
  body('position').trim().notEmpty().withMessage('Position is required').isLength({ max: 255 }),
  body('category').isIn(['leadership', 'council', 'other']).withMessage('Invalid category'),
  body('displayOrder').optional().isInt({ min: 0 })
];

export const getTeamMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, isActive, page = 1, limit = 100 } = req.query;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    } else {
      where.isActive = true; // Default: only active members
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const { rows: teamMembers, count } = await TeamMember.findAndCountAll({
      where,
      limit: parseInt(limit as string),
      offset,
      order: [['displayOrder', 'ASC'], ['name', 'ASC']]
    });

    res.json({
      teamMembers,
      pagination: {
        total: count,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(count / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTeamMemberById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const teamMember = await TeamMember.findByPk(id);

    if (!teamMember) {
      res.status(404).json({ error: 'Team member not found' });
      return;
    }

    res.json({ teamMember });
  } catch (error) {
    console.error('Get team member by id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTeamMember = async (req: any, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, position, bio, category, isActive, displayOrder } = req.body;

    let photoUrl = undefined;
    if (req.file) {
      photoUrl = `/uploads/team/${req.file.filename}`;
    }

    const teamMember = await TeamMember.create({
      name,
      position,
      bio,
      photoUrl,
      category,
      isActive: isActive === 'true' || isActive === true || isActive === undefined,
      displayOrder: displayOrder ? parseInt(displayOrder) : 0
    });

    res.status(201).json({ message: 'Team member created successfully', teamMember });
  } catch (error) {
    console.error('Create team member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTeamMember = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, position, bio, category, isActive, displayOrder } = req.body;

    const teamMember = await TeamMember.findByPk(id);

    if (!teamMember) {
      res.status(404).json({ error: 'Team member not found' });
      return;
    }

    // Update fields
    if (name) teamMember.name = name;
    if (position) teamMember.position = position;
    if (bio !== undefined) teamMember.bio = bio;
    if (category) teamMember.category = category;
    if (isActive !== undefined) teamMember.isActive = isActive === 'true' || isActive === true;
    if (displayOrder !== undefined) teamMember.displayOrder = parseInt(displayOrder);

    // Handle photo upload
    if (req.file) {
      // Delete old photo if exists
      if (teamMember.photoUrl) {
        const oldPhotoPath = path.join(process.cwd(), teamMember.photoUrl);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      teamMember.photoUrl = `/uploads/team/${req.file.filename}`;
    }

    await teamMember.save();

    res.json({ message: 'Team member updated successfully', teamMember });
  } catch (error) {
    console.error('Update team member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTeamMember = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const teamMember = await TeamMember.findByPk(id);

    if (!teamMember) {
      res.status(404).json({ error: 'Team member not found' });
      return;
    }

    // Delete photo if exists
    if (teamMember.photoUrl) {
      const photoPath = path.join(process.cwd(), teamMember.photoUrl);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await teamMember.destroy();

    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Delete team member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
