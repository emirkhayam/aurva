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

    const { title, slug, excerpt, content, category, published } = req.body;

    // Handle multiple images
    const files = req.files as Express.Multer.File[] || [];
    let imageUrl = undefined;

    // Set main imageUrl to first image for backward compatibility
    if (files.length > 0) {
      imageUrl = `/uploads/news/${files[0].filename}`;
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

    // Create NewsImage records for all uploaded images
    if (files.length > 0) {
      const imagePromises = files.map((file, index) =>
        NewsImage.create({
          newsId: news.id,
          imageUrl: `/uploads/news/${file.filename}`,
          displayOrder: index
        })
      );
      await Promise.all(imagePromises);
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
    const { title, excerpt, content, category, published } = req.body;

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

    // Handle multiple image uploads
    const files = req.files as Express.Multer.File[] || [];

    if (files.length > 0) {
      // Delete old images from filesystem and database
      const oldImages = await NewsImage.findAll({ where: { newsId: id } });

      for (const oldImage of oldImages) {
        const oldImagePath = path.join(process.cwd(), oldImage.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
        await oldImage.destroy();
      }

      // Delete old main image if exists
      if (news.imageUrl) {
        const oldMainImagePath = path.join(process.cwd(), news.imageUrl);
        if (fs.existsSync(oldMainImagePath)) {
          fs.unlinkSync(oldMainImagePath);
        }
      }

      // Update main imageUrl to first new image
      news.imageUrl = `/uploads/news/${files[0].filename}`;

      // Create new NewsImage records
      const imagePromises = files.map((file, index) =>
        NewsImage.create({
          newsId: news.id,
          imageUrl: `/uploads/news/${file.filename}`,
          displayOrder: index
        })
      );
      await Promise.all(imagePromises);
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
