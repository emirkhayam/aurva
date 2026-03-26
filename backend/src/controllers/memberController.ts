import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { getSupabaseClient, generateSlug, deleteFromSupabase, extractPathFromUrl } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';

export const validateMember = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 255 }),
  body('website').optional().isURL().withMessage('Invalid URL format'),
  body('displayOrder').optional().isInt({ min: 0 })
];

export const getMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isActive, page = 1, limit = 50 } = req.query;
    const supabase = getSupabaseClient();

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('members')
      .select('*', { count: 'exact' });

    // By default, show only active members for public endpoint
    if (isActive !== undefined) {
      query = query.eq('is_active', isActive === 'true');
    } else {
      query = query.eq('is_active', true);
    }

    const { data: members, error, count } = await query
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })
      .range(offset, offset + limitNum - 1);

    if (error) {
      console.error('Get members error:', error);
      res.status(500).json({ error: 'Failed to fetch members' });
      return;
    }

    res.json({
      members: members || [],
      pagination: {
        total: count || 0,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil((count || 0) / limitNum)
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
    const supabase = getSupabaseClient();

    const { data: member, error } = await supabase
      .from('members')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    res.json({ member });
  } catch (error) {
    console.error('Get member by slug error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, slug, description, website, isActive, displayOrder, joinedDate, logoUrl: providedLogoUrl } = req.body;
    const supabase = getSupabaseClient();

    let logoUrl: string | undefined = undefined;
    const file = (req as any).supabaseFile;
    if (file) {
      // File upload takes priority over URL
      logoUrl = file.publicUrl;
    } else if (providedLogoUrl) {
      // Use provided URL if no file uploaded
      logoUrl = providedLogoUrl;
    }

    const generatedSlug = slug || generateSlug(name);

    const { data: member, error } = await supabase
      .from('members')
      .insert({
        name,
        slug: generatedSlug,
        description,
        website,
        logo_url: logoUrl,
        is_active: isActive === 'true' || isActive === true || isActive === undefined,
        display_order: displayOrder ? parseInt(displayOrder) : 0,
        joined_date: joinedDate ? new Date(joinedDate).toISOString() : undefined
      })
      .select()
      .single();

    if (error) {
      console.error('Create member error:', error);
      res.status(500).json({ error: 'Failed to create member' });
      return;
    }

    res.status(201).json({ message: 'Member created successfully', member });
  } catch (error) {
    console.error('Create member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, website, isActive, displayOrder, joinedDate, logoUrl: providedLogoUrl } = req.body;
    const supabase = getSupabaseClient();

    // Check if member exists
    const { data: existingMember, error: fetchError } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingMember) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (website !== undefined) updateData.website = website;
    if (isActive !== undefined) updateData.is_active = isActive === 'true' || isActive === true;
    if (displayOrder !== undefined) updateData.display_order = parseInt(displayOrder);
    if (joinedDate !== undefined) updateData.joined_date = joinedDate ? new Date(joinedDate).toISOString() : null;

    // Handle logo upload
    const file = (req as any).supabaseFile;
    if (file) {
      // File upload takes priority - delete old logo if exists
      if (existingMember.logo_url) {
        const oldFilePath = extractPathFromUrl(existingMember.logo_url);
        if (oldFilePath) {
          await deleteFromSupabase(oldFilePath);
        }
      }
      updateData.logo_url = file.publicUrl;
    } else if (providedLogoUrl !== undefined) {
      // Use provided URL if no file uploaded
      updateData.logo_url = providedLogoUrl;
    }

    const { error } = await supabase
      .from('members')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Update member error:', error);
      res.status(500).json({ error: 'Failed to update member' });
      return;
    }

    // Fetch updated member
    const { data: member } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    res.json({ message: 'Member updated successfully', member });
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();

    // Get member
    const { data: member, error: fetchError } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    // Delete logo from Supabase Storage if exists
    if (member.logo_url) {
      const filePath = extractPathFromUrl(member.logo_url);
      if (filePath) {
        await deleteFromSupabase(filePath);
      }
    }

    // Delete member record
    const { error: deleteError } = await supabase
      .from('members')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete member error:', deleteError);
      res.status(500).json({ error: 'Failed to delete member' });
      return;
    }

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
