import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { News, NewsImage } from '../models';
import fs from 'fs';
import path from 'path';

export const validateNews = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 500 }),
  body('excerpt').trim().notEmpty().withMessage('Excerpt is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('category').optional().isIn(['regulation', 'events', 'analytics', 'other'])
];

export const getNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { published, category, page = 1, limit = 10 } = req.query;

    const where: any = {};
    // By default, show only published news for public endpoint
    if (published !== undefined) {
      where.published = published === 'true';
    } else {
      where.published = true; // Default: only published
    }
    if (category) {
      where.category = category;
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const { rows: news, count } = await News.findAndCountAll({
      where,
      limit: parseInt(limit as string),
      offset,
      order: [['publishedAt', 'DESC'], ['createdAt', 'DESC']],
      include: [{
        model: NewsImage,
        as: 'images',
        attributes: ['id', 'imageUrl', 'displayOrder'],
        order: [['displayOrder', 'ASC']]
      }]
    });

    res.json({
      news,
      pagination: {
        total: count,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(count / parseInt(limit as string))
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

    const news = await News.findOne({
      where: { slug },
      include: [{
        model: NewsImage,
        as: 'images',
        attributes: ['id', 'imageUrl', 'displayOrder'],
        order: [['displayOrder', 'ASC']]
      }]
    });

    if (!news) {
      res.status(404).json({ error: 'News not found' });
      return;
    }

    // Increment views
    news.views += 1;
    await news.save();

    res.json({ news });
  } catch (error) {
    console.error('Get news by slug error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createNews = async (req: any, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { title, slug, excerpt, content, category, published, imageUrls } = req.body;

    // Handle multiple images from Supabase Storage
    const supabaseFiles = req.supabaseFiles || [];

    // Handle image URLs from form
    let parsedImageUrls: string[] = [];
    if (imageUrls) {
      try {
        parsedImageUrls = typeof imageUrls === 'string' ? JSON.parse(imageUrls) : imageUrls;
        if (!Array.isArray(parsedImageUrls)) {
          parsedImageUrls = [parsedImageUrls];
        }
      } catch {
        // If not JSON, treat as single URL
        parsedImageUrls = [imageUrls];
      }
    }

    let imageUrl = undefined;

    // Set main imageUrl (prioritize uploaded files from Supabase, then URLs)
    if (supabaseFiles.length > 0) {
      imageUrl = supabaseFiles[0].publicUrl;
    } else if (parsedImageUrls.length > 0) {
      imageUrl = parsedImageUrls[0];
    }

    // Generate slug from title if not provided
    const generatedSlug = slug && slug.trim()
      ? slug
      : title.toLowerCase()
          .replace(/[^а-яёa-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

    const newsData: any = {
      title,
      slug: generatedSlug,
      excerpt,
      content,
      category: category || 'other',
      imageUrl,
      published: published === 'true' || published === true,
      views: 0
    };

    const news = await News.create(newsData);

    const allImagePromises = [];

    // Create NewsImage records for uploaded files from Supabase
    if (supabaseFiles.length > 0) {
      supabaseFiles.forEach((file, index) => {
        allImagePromises.push(
          NewsImage.create({
            newsId: news.id,
            imageUrl: file.publicUrl,
            displayOrder: index
          })
        );
      });
    }

    // Create NewsImage records for image URLs
    if (parsedImageUrls.length > 0) {
      const startIndex = supabaseFiles.length;
      parsedImageUrls.forEach((url, index) => {
        if (url && url.trim()) {
          allImagePromises.push(
            NewsImage.create({
              newsId: news.id,
              imageUrl: url.trim(),
              displayOrder: startIndex + index
            })
          );
        }
      });
    }

    if (allImagePromises.length > 0) {
      await Promise.all(allImagePromises);
    }

    // Fetch the created news with images
    const createdNews = await News.findByPk(news.id, {
      include: [{
        model: NewsImage,
        as: 'images',
        attributes: ['id', 'imageUrl', 'displayOrder']
      }]
    });

    res.status(201).json({ message: 'News created successfully', news: createdNews });
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateNews = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, excerpt, content, category, published, imageUrls } = req.body;

    const news = await News.findByPk(id, {
      include: [{
        model: NewsImage,
        as: 'images'
      }]
    });

    if (!news) {
      res.status(404).json({ error: 'News not found' });
      return;
    }

    // Update fields
    if (title) news.title = title;
    if (excerpt) news.excerpt = excerpt;
    if (content) news.content = content;
    if (category) news.category = category;
    if (published !== undefined) news.published = published === 'true' || published === true;

    // Handle multiple image uploads from Supabase
    const supabaseFiles = req.supabaseFiles || [];

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
      // Delete old images from database (Supabase files deletion handled separately)
      const oldImages = await NewsImage.findAll({ where: { newsId: id } });

      for (const oldImage of oldImages) {
        await oldImage.destroy();
      }

      // Update main imageUrl (prioritize uploaded files from Supabase, then URLs)
      if (supabaseFiles.length > 0) {
        news.imageUrl = supabaseFiles[0].publicUrl;
      } else if (parsedImageUrls.length > 0) {
        news.imageUrl = parsedImageUrls[0];
      }

      const allImagePromises = [];

      // Create new NewsImage records for uploaded files from Supabase
      if (supabaseFiles.length > 0) {
        supabaseFiles.forEach((file, index) => {
          allImagePromises.push(
            NewsImage.create({
              newsId: news.id,
              imageUrl: file.publicUrl,
              displayOrder: index
            })
          );
        });
      }

      // Create new NewsImage records for image URLs
      if (parsedImageUrls.length > 0) {
        const startIndex = supabaseFiles.length;
        parsedImageUrls.forEach((url, index) => {
          if (url && url.trim()) {
            allImagePromises.push(
              NewsImage.create({
                newsId: news.id,
                imageUrl: url.trim(),
                displayOrder: startIndex + index
              })
            );
          }
        });
      }

      if (allImagePromises.length > 0) {
        await Promise.all(allImagePromises);
      }
    }

    await news.save();

    // Fetch updated news with images
    const updatedNews = await News.findByPk(id, {
      include: [{
        model: NewsImage,
        as: 'images',
        attributes: ['id', 'imageUrl', 'displayOrder']
      }]
    });

    res.json({ message: 'News updated successfully', news: updatedNews });
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteNews = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const news = await News.findByPk(id);

    if (!news) {
      res.status(404).json({ error: 'News not found' });
      return;
    }

    // Delete all associated images from filesystem
    const newsImages = await NewsImage.findAll({ where: { newsId: id } });

    for (const image of newsImages) {
      const imagePath = path.join(process.cwd(), image.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete main image if exists
    if (news.imageUrl) {
      const mainImagePath = path.join(process.cwd(), news.imageUrl);
      if (fs.existsSync(mainImagePath)) {
        fs.unlinkSync(mainImagePath);
      }
    }

    // Delete news (CASCADE will delete NewsImage records automatically)
    await news.destroy();

    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
