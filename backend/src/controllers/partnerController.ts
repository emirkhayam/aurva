import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { getSupabaseClient, generateSlug, deleteFromSupabase, extractPathFromUrl } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';

export const validatePartner = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 255 }),
  body('website').optional({ checkFalsy: true }).trim(),
  body('displayOrder').optional().isInt({ min: 0 })
];

export const getPartners = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isActive, page = 1, limit = 50 } = req.query;
    const supabase = getSupabaseClient();

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('partners')
      .select('*', { count: 'exact' });

    // By default, show only active partners for public endpoint
    if (isActive !== undefined) {
      query = query.eq('is_active', isActive === 'true');
    } else {
      query = query.eq('is_active', true);
    }

    const { data: partners, error, count } = await query
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })
      .range(offset, offset + limitNum - 1);

    if (error) {
      console.error('Get partners error:', error);
      res.status(500).json({ error: 'Failed to fetch partners' });
      return;
    }

    res.json({
      partners: partners || [],
      pagination: {
        total: count || 0,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil((count || 0) / limitNum)
      }
    });
  } catch (error) {
    console.error('Get partners error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPartnerBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const supabase = getSupabaseClient();

    const { data: partner, error } = await supabase
      .from('partners')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !partner) {
      res.status(404).json({ error: 'Partner not found' });
      return;
    }

    res.json({ partner });
  } catch (error) {
    console.error('Get partner by slug error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPartner = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, slug, website, modalTitle, modalDescription, benefits, isActive, displayOrder, logoUrl: logoUrlFromBody } = req.body;
    const supabase = getSupabaseClient();

    let logoUrl: string | undefined = undefined;

    // Priority: URL from body, then uploaded file
    if (logoUrlFromBody) {
      logoUrl = logoUrlFromBody;
    } else {
      const file = (req as any).supabaseFile;
      if (file) {
        logoUrl = file.publicUrl;
      }
    }

    // Generate slug from name if not provided
    const generatedSlug = slug || generateSlug(name);

    const { data: partner, error } = await supabase
      .from('partners')
      .insert({
        name,
        slug: generatedSlug,
        website,
        logo_url: logoUrl,
        modal_title: modalTitle,
        modal_description: modalDescription,
        benefits,
        is_active: isActive === 'true' || isActive === true || isActive === undefined,
        display_order: displayOrder ? parseInt(displayOrder) : 0
      })
      .select()
      .single();

    if (error) {
      console.error('Create partner error:', error);
      res.status(500).json({
        error: 'Failed to create partner',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
      return;
    }

    res.status(201).json({ message: 'Partner created successfully', partner });
  } catch (error: any) {
    console.error('Create partner error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
};

export const updatePartner = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, website, modalTitle, modalDescription, benefits, isActive, displayOrder, logoUrl: logoUrlFromBody } = req.body;
    const supabase = getSupabaseClient();

    // Check if partner exists
    const { data: existingPartner, error: fetchError } = await supabase
      .from('partners')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingPartner) {
      res.status(404).json({ error: 'Partner not found' });
      return;
    }

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (website !== undefined) updateData.website = website;
    if (modalTitle !== undefined) updateData.modal_title = modalTitle;
    if (modalDescription !== undefined) updateData.modal_description = modalDescription;
    if (benefits !== undefined) updateData.benefits = benefits;
    if (isActive !== undefined) updateData.is_active = isActive === 'true' || isActive === true;
    if (displayOrder !== undefined) updateData.display_order = parseInt(displayOrder);

    // Handle logo: URL has priority over file upload
    if (logoUrlFromBody) {
      // If URL provided, delete old file if it was a Supabase file (not external URL)
      if (existingPartner.logo_url && !existingPartner.logo_url.startsWith('http://') && !existingPartner.logo_url.startsWith('https://')) {
        const oldFilePath = extractPathFromUrl(existingPartner.logo_url);
        if (oldFilePath) {
          await deleteFromSupabase(oldFilePath);
        }
      }
      updateData.logo_url = logoUrlFromBody;
    } else {
      const file = (req as any).supabaseFile;
      if (file) {
        // Delete old file if it was a Supabase file
        if (existingPartner.logo_url) {
          const oldFilePath = extractPathFromUrl(existingPartner.logo_url);
          if (oldFilePath) {
            await deleteFromSupabase(oldFilePath);
          }
        }
        updateData.logo_url = file.publicUrl;
      }
    }

    const { error } = await supabase
      .from('partners')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Update partner error:', error);
      res.status(500).json({ error: 'Failed to update partner' });
      return;
    }

    // Fetch updated partner
    const { data: partner } = await supabase
      .from('partners')
      .select('*')
      .eq('id', id)
      .single();

    res.json({ message: 'Partner updated successfully', partner });
  } catch (error) {
    console.error('Update partner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePartner = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();

    // Get partner
    const { data: partner, error: fetchError } = await supabase
      .from('partners')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !partner) {
      res.status(404).json({ error: 'Partner not found' });
      return;
    }

    // Delete logo from Supabase Storage if exists (only if it's a Supabase file, not external URL)
    if (partner.logo_url) {
      const filePath = extractPathFromUrl(partner.logo_url);
      if (filePath) {
        await deleteFromSupabase(filePath);
      }
    }

    // Delete partner record
    const { error: deleteError } = await supabase
      .from('partners')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete partner error:', deleteError);
      res.status(500).json({ error: 'Failed to delete partner' });
      return;
    }

    res.json({ message: 'Partner deleted successfully' });
  } catch (error) {
    console.error('Delete partner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
