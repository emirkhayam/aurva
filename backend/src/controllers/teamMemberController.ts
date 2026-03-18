import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { getSupabaseClient, deleteFromSupabase, extractPathFromUrl } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';

export const validateTeamMember = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 255 }),
  body('position').trim().notEmpty().withMessage('Position is required').isLength({ max: 255 }),
  body('category').isIn(['leadership', 'council', 'other']).withMessage('Invalid category'),
  body('displayOrder').optional().isInt({ min: 0 })
];

export const getTeamMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, isActive, page = 1, limit = 100 } = req.query;
    const supabase = getSupabaseClient();

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('team_members')
      .select('*', { count: 'exact' });

    if (category) {
      query = query.eq('category', category);
    }

    if (isActive !== undefined) {
      query = query.eq('is_active', isActive === 'true');
    } else {
      query = query.eq('is_active', true);
    }

    const { data: teamMembers, error, count } = await query
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })
      .range(offset, offset + limitNum - 1);

    if (error) {
      console.error('Get team members error:', error);
      res.status(500).json({ error: 'Failed to fetch team members' });
      return;
    }

    res.json({
      teamMembers: teamMembers || [],
      pagination: {
        total: count || 0,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil((count || 0) / limitNum)
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
    const supabase = getSupabaseClient();

    const { data: teamMember, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !teamMember) {
      res.status(404).json({ error: 'Team member not found' });
      return;
    }

    res.json({ teamMember });
  } catch (error) {
    console.error('Get team member by id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTeamMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, position, bio, category, isActive, displayOrder } = req.body;
    const supabase = getSupabaseClient();

    let photoUrl: string | undefined = undefined;
    const file = (req as any).supabaseFile;
    if (file) {
      photoUrl = file.publicUrl;
    }

    const { data: teamMember, error } = await supabase
      .from('team_members')
      .insert({
        name,
        position,
        bio,
        photo_url: photoUrl,
        category,
        is_active: isActive === 'true' || isActive === true || isActive === undefined,
        display_order: displayOrder ? parseInt(displayOrder) : 0
      })
      .select()
      .single();

    if (error) {
      console.error('Create team member error:', error);
      res.status(500).json({ error: 'Failed to create team member' });
      return;
    }

    res.status(201).json({ message: 'Team member created successfully', teamMember });
  } catch (error) {
    console.error('Create team member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTeamMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, position, bio, category, isActive, displayOrder } = req.body;
    const supabase = getSupabaseClient();

    // Check if team member exists
    const { data: existingMember, error: fetchError } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingMember) {
      res.status(404).json({ error: 'Team member not found' });
      return;
    }

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (position) updateData.position = position;
    if (bio !== undefined) updateData.bio = bio;
    if (category) updateData.category = category;
    if (isActive !== undefined) updateData.is_active = isActive === 'true' || isActive === true;
    if (displayOrder !== undefined) updateData.display_order = parseInt(displayOrder);

    // Handle photo upload
    const file = (req as any).supabaseFile;
    if (file) {
      // Delete old photo if exists
      if (existingMember.photo_url) {
        const oldFilePath = extractPathFromUrl(existingMember.photo_url);
        if (oldFilePath) {
          await deleteFromSupabase(oldFilePath);
        }
      }
      updateData.photo_url = file.publicUrl;
    }

    const { error } = await supabase
      .from('team_members')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Update team member error:', error);
      res.status(500).json({ error: 'Failed to update team member' });
      return;
    }

    // Fetch updated team member
    const { data: teamMember } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', id)
      .single();

    res.json({ message: 'Team member updated successfully', teamMember });
  } catch (error) {
    console.error('Update team member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTeamMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();

    // Get team member
    const { data: teamMember, error: fetchError } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !teamMember) {
      res.status(404).json({ error: 'Team member not found' });
      return;
    }

    // Delete photo from Supabase Storage if exists
    if (teamMember.photo_url) {
      const filePath = extractPathFromUrl(teamMember.photo_url);
      if (filePath) {
        await deleteFromSupabase(filePath);
      }
    }

    // Delete team member record
    const { error: deleteError } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete team member error:', deleteError);
      res.status(500).json({ error: 'Failed to delete team member' });
      return;
    }

    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Delete team member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
