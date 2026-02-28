import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Partner from '../models/Partner';
import fs from 'fs';
import path from 'path';

export const validatePartner = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 255 }),
  body('website').optional({ checkFalsy: true }).trim(),
  body('displayOrder').optional().isInt({ min: 0 })
];

export const getPartners = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isActive, page = 1, limit = 50 } = req.query;

    const where: any = {};
    // By default, show only active partners for public endpoint
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    } else {
      where.isActive = true; // Default: only active
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const { rows: partners, count } = await Partner.findAndCountAll({
      where,
      limit: parseInt(limit as string),
      offset,
      order: [['displayOrder', 'ASC'], ['name', 'ASC']]
    });

    res.json({
      partners,
      pagination: {
        total: count,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(count / parseInt(limit as string))
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

    const partner = await Partner.findOne({ where: { slug } });

    if (!partner) {
      res.status(404).json({ error: 'Partner not found' });
      return;
    }

    res.json({ partner });
  } catch (error) {
    console.error('Get partner by slug error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPartner = async (req: any, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, slug, website, modalTitle, modalDescription, benefits, isActive, displayOrder, logoUrl: logoUrlFromBody } = req.body;

    let logoUrl = undefined;

    // Приоритет: сначала URL из body, потом файл
    if (logoUrlFromBody) {
      logoUrl = logoUrlFromBody;
    } else if (req.file) {
      logoUrl = `/uploads/logos/${req.file.filename}`;
    }

    // Генерируем slug из названия, если не предоставлен
    const generatedSlug = slug || name
      .toLowerCase()
      .replace(/[^а-яёa-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const partner = await Partner.create({
      name,
      slug: generatedSlug,
      website,
      logoUrl,
      modalTitle,
      modalDescription,
      benefits,
      isActive: isActive === 'true' || isActive === true || isActive === undefined,
      displayOrder: displayOrder ? parseInt(displayOrder) : 0
    });

    res.status(201).json({ message: 'Partner created successfully', partner });
  } catch (error: any) {
    console.error('=== CREATE PARTNER ERROR ===');
    console.error('Error message:', error?.message);
    console.error('Error name:', error?.name);
    console.error('Error stack:', error?.stack);
    console.error('Request body:', req.body);
    console.error('Request file:', req.file);
    console.error('===========================');
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
};

export const updatePartner = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, website, modalTitle, modalDescription, benefits, isActive, displayOrder, logoUrl: logoUrlFromBody } = req.body;

    const partner = await Partner.findByPk(id);

    if (!partner) {
      res.status(404).json({ error: 'Partner not found' });
      return;
    }

    // Update fields
    if (name) partner.name = name;
    if (website !== undefined) partner.website = website;
    if (modalTitle !== undefined) partner.modalTitle = modalTitle;
    if (modalDescription !== undefined) partner.modalDescription = modalDescription;
    if (benefits !== undefined) partner.benefits = benefits;
    if (isActive !== undefined) partner.isActive = isActive === 'true' || isActive === true;
    if (displayOrder !== undefined) partner.displayOrder = parseInt(displayOrder);

    // Handle logo: URL has priority over file upload
    if (logoUrlFromBody) {
      // Если предоставлен URL, удаляем старый файл (если это был файл, а не URL)
      if (partner.logoUrl && !partner.logoUrl.startsWith('http')) {
        const oldLogoPath = path.join(process.cwd(), partner.logoUrl);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
      partner.logoUrl = logoUrlFromBody;
    } else if (req.file) {
      // Если загружен новый файл, удаляем старый файл
      if (partner.logoUrl && !partner.logoUrl.startsWith('http')) {
        const oldLogoPath = path.join(process.cwd(), partner.logoUrl);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
      partner.logoUrl = `/uploads/logos/${req.file.filename}`;
    }

    await partner.save();

    res.json({ message: 'Partner updated successfully', partner });
  } catch (error) {
    console.error('Update partner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePartner = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const partner = await Partner.findByPk(id);

    if (!partner) {
      res.status(404).json({ error: 'Partner not found' });
      return;
    }

    // Delete logo file if exists (только если это не URL)
    if (partner.logoUrl && !partner.logoUrl.startsWith('http')) {
      const logoPath = path.join(process.cwd(), partner.logoUrl);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }

    await partner.destroy();

    res.json({ message: 'Partner deleted successfully' });
  } catch (error) {
    console.error('Delete partner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
