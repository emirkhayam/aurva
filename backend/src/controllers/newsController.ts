import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { getSupabaseClient, generateSlug, deleteFromSupabase, extractPathFromUrl } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';

export const validateNews = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 500 }),
  body('excerpt').trim().notEmpty().withMessage('Excerpt is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('category').optional().isIn(['regulation', 'events', 'analytics', 'other'])
];

export const getNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { published, category, page = 1, limit = 10 } = req.query;
    const supabase = getSupabaseClient();

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('news')
      .select(`
        *,
        news_images(id, image_url, display_order)
      `, { count: 'exact' });

    // By default, show only published news for public endpoint
    if (published !== undefined) {
      query = query.eq('published', published === 'true');
    } else {
      query = query.eq('published', true);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data: news, error, count } = await query
      .order('published_at', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) {
      console.error('Get news error:', error);
      res.status(500).json({ error: 'Failed to fetch news' });
      return;
    }

    res.json({
      news: news || [],
      pagination: {
        total: count || 0,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil((count || 0) / limitNum)
      }
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getNewsBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const supabase = getSupabaseClient();

    const { data: news, error } = await supabase
      .from('news')
      .select(`
        *,
        news_images(id, image_url, display_order)
      `)
      .eq('slug', slug)
      .single();

    if (error || !news) {
      console.error('Get news by slug error:', error);
      res.status(404).json({ error: 'News not found' });
      return;
    }

    // Increment views
    await supabase
      .from('news')
      .update({ views: (news.views || 0) + 1 })
      .eq('id', news.id);

    res.json({ news });
  } catch (error) {
    console.error('Get news by slug error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createNews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { title, slug, excerpt, content, category, published, imageUrls } = req.body;
    const supabase = getSupabaseClient();

    // Handle multiple images from Supabase Storage
    const supabaseFiles = (req as any).supabaseFiles || [];

    // Handle image URLs from form
    let parsedImageUrls: string[] = [];
    if (imageUrls) {
      try {
        parsedImageUrls = typeof imageUrls === 'string' ? JSON.parse(imageUrls) : imageUrls;
        if (!Array.isArray(parsedImageUrls)) {
          parsedImageUrls = [parsedImageUrls];
        }
      } catch {
        parsedImageUrls = [imageUrls];
      }
    }

    let imageUrl: string | undefined = undefined;

    // Set main imageUrl (prioritize uploaded files from Supabase, then URLs)
    if (supabaseFiles.length > 0) {
      imageUrl = supabaseFiles[0].publicUrl;
    } else if (parsedImageUrls.length > 0) {
      imageUrl = parsedImageUrls[0];
    }

    // Generate slug from title if not provided
    const generatedSlug = slug && slug.trim() ? slug : generateSlug(title);

    // Create news record
    const { data: news, error: newsError } = await supabase
      .from('news')
      .insert({
        title,
        slug: generatedSlug,
        excerpt,
        content,
        category: category || 'other',
        image_url: imageUrl,
        published: published === 'true' || published === true,
        views: 0
      })
      .select()
      .single();

    if (newsError || !news) {
      console.error('Create news error:', newsError);
      res.status(500).json({ error: 'Failed to create news' });
      return;
    }

    // Create news_images records
    const allImages: any[] = [];

    // Add uploaded files from Supabase
    if (supabaseFiles.length > 0) {
      supabaseFiles.forEach((file: any, index: number) => {
        allImages.push({
          news_id: news.id,
          image_url: file.publicUrl,
          display_order: index
        });
      });
    }

    // Add image URLs
    if (parsedImageUrls.length > 0) {
      const startIndex = supabaseFiles.length;
      parsedImageUrls.forEach((url, index) => {
        if (url && url.trim()) {
          allImages.push({
            news_id: news.id,
            image_url: url.trim(),
            display_order: startIndex + index
          });
        }
      });
    }

    if (allImages.length > 0) {
      await supabase
        .from('news_images')
        .insert(allImages);
    }

    // Fetch the created news with images
    const { data: createdNews } = await supabase
      .from('news')
      .select(`
        *,
        news_images(id, image_url, display_order)
      `)
      .eq('id', news.id)
      .single();

    res.status(201).json({ message: 'News created successfully', news: createdNews });
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateNews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, excerpt, content, category, published, imageUrls } = req.body;
    const supabase = getSupabaseClient();

    // Check if news exists
    const { data: existingNews, error: fetchError } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingNews) {
      res.status(404).json({ error: 'News not found' });
      return;
    }

    // Prepare update data
    const updateData: any = {};
    if (title) updateData.title = title;
    if (excerpt) updateData.excerpt = excerpt;
    if (content) updateData.content = content;
    if (category) updateData.category = category;
    if (published !== undefined) updateData.published = published === 'true' || published === true;

    // Handle multiple image uploads from Supabase
    const supabaseFiles = (req as any).supabaseFiles || [];

    // Handle image URLs from form
    let parsedImageUrls: string[] = [];
    if (imageUrls) {
      try {
        parsedImageUrls = typeof imageUrls === 'string' ? JSON.parse(imageUrls) : imageUrls;
        if (!Array.isArray(parsedImageUrls)) {
          parsedImageUrls = [parsedImageUrls];
        }
      } catch {
        parsedImageUrls = [imageUrls];
      }
    }

    // If we have new files or URLs, replace all images
    if (supabaseFiles.length > 0 || parsedImageUrls.length > 0) {
      // Get old images to delete from Supabase Storage
      const { data: oldImages } = await supabase
        .from('news_images')
        .select('*')
        .eq('news_id', id);

      // Delete old images from Supabase Storage
      if (oldImages && oldImages.length > 0) {
        for (const oldImage of oldImages) {
          const filePath = extractPathFromUrl(oldImage.image_url);
          if (filePath) {
            await deleteFromSupabase(filePath);
          }
        }
      }

      // Delete old main image from Supabase Storage if exists
      if (existingNews.image_url) {
        const mainFilePath = extractPathFromUrl(existingNews.image_url);
        if (mainFilePath) {
          await deleteFromSupabase(mainFilePath);
        }
      }

      // Delete old images from database
      await supabase
        .from('news_images')
        .delete()
        .eq('news_id', id);

      // Update main imageUrl (prioritize uploaded files from Supabase, then URLs)
      if (supabaseFiles.length > 0) {
        updateData.image_url = supabaseFiles[0].publicUrl;
      } else if (parsedImageUrls.length > 0) {
        updateData.image_url = parsedImageUrls[0];
      }

      // Create new news_images records
      const allImages: any[] = [];

      // Add uploaded files from Supabase
      if (supabaseFiles.length > 0) {
        supabaseFiles.forEach((file: any, index: number) => {
          allImages.push({
            news_id: id,
            image_url: file.publicUrl,
            display_order: index
          });
        });
      }

      // Add image URLs
      if (parsedImageUrls.length > 0) {
        const startIndex = supabaseFiles.length;
        parsedImageUrls.forEach((url, index) => {
          if (url && url.trim()) {
            allImages.push({
              news_id: id,
              image_url: url.trim(),
              display_order: startIndex + index
            });
          }
        });
      }

      if (allImages.length > 0) {
        await supabase
          .from('news_images')
          .insert(allImages);
      }
    }

    // Update news record
    const { error: updateError } = await supabase
      .from('news')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Update news error:', updateError);
      res.status(500).json({ error: 'Failed to update news' });
      return;
    }

    // Fetch updated news with images
    const { data: updatedNews } = await supabase
      .from('news')
      .select(`
        *,
        news_images(id, image_url, display_order)
      `)
      .eq('id', id)
      .single();

    res.json({ message: 'News updated successfully', news: updatedNews });
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteNews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();

    // Get news with images
    const { data: news, error: fetchError } = await supabase
      .from('news')
      .select(`
        *,
        news_images(id, image_url)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !news) {
      res.status(404).json({ error: 'News not found' });
      return;
    }

    // Delete all associated images from Supabase Storage
    if (news.news_images && Array.isArray(news.news_images)) {
      for (const image of news.news_images) {
        const filePath = extractPathFromUrl(image.image_url);
        if (filePath) {
          await deleteFromSupabase(filePath);
        }
      }
    }

    // Delete main image from Supabase Storage if exists
    if (news.image_url) {
      const mainFilePath = extractPathFromUrl(news.image_url);
      if (mainFilePath) {
        await deleteFromSupabase(mainFilePath);
      }
    }

    // Delete news_images records (CASCADE should handle this, but explicit is safer)
    await supabase
      .from('news_images')
      .delete()
      .eq('news_id', id);

    // Delete news record
    const { error: deleteError } = await supabase
      .from('news')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete news error:', deleteError);
      res.status(500).json({ error: 'Failed to delete news' });
      return;
    }

    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
