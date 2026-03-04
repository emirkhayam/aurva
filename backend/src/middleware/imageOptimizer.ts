import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to optimize uploaded images using Sharp
 * - Resizes large images to max 1920x1920
 * - Converts to WebP for better compression
 * - Reduces quality to 85% (good balance)
 * - Keeps original filename structure
 */
export const optimizeImages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if files were uploaded
    if (!req.files && !req.file) {
      return next();
    }

    const files: Express.Multer.File[] = [];

    // Handle both single file and multiple files
    if (req.file) {
      files.push(req.file);
    } else if (req.files) {
      if (Array.isArray(req.files)) {
        files.push(...req.files);
      } else {
        // req.files is an object with fieldnames as keys
        Object.values(req.files).forEach((fileArray) => {
          if (Array.isArray(fileArray)) {
            files.push(...fileArray);
          }
        });
      }
    }

    // Optimize each uploaded image
    for (const file of files) {
      // Skip SVG files (vector graphics don't need optimization)
      if (file.mimetype === 'image/svg+xml') {
        continue;
      }

      try {
        const originalPath = file.path;
        const ext = path.extname(file.filename);
        const nameWithoutExt = file.filename.replace(ext, '');

        // Convert to WebP for better compression
        const optimizedFilename = `${nameWithoutExt}.webp`;
        const optimizedPath = path.join(path.dirname(originalPath), optimizedFilename);

        // Optimize image
        await sharp(originalPath)
          .resize(1920, 1920, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 85 })
          .toFile(optimizedPath);

        // Delete original file
        fs.unlinkSync(originalPath);

        // Update file object with new path and filename
        file.path = optimizedPath;
        file.filename = optimizedFilename;
        file.mimetype = 'image/webp';
      } catch (imageError) {
        console.error(`Error optimizing image ${file.filename}:`, imageError);
        // Continue with original file if optimization fails
      }
    }

    next();
  } catch (error) {
    console.error('Image optimization middleware error:', error);
    // Don't block the request if optimization fails
    next();
  }
};

/**
 * Optional: Create thumbnail versions of images
 * Useful for galleries and lists
 */
export const createThumbnails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.files && !req.file) {
      return next();
    }

    const files: Express.Multer.File[] = [];

    if (req.file) {
      files.push(req.file);
    } else if (req.files) {
      if (Array.isArray(req.files)) {
        files.push(...req.files);
      } else {
        Object.values(req.files).forEach((fileArray) => {
          if (Array.isArray(fileArray)) {
            files.push(...fileArray);
          }
        });
      }
    }

    for (const file of files) {
      if (file.mimetype === 'image/svg+xml') {
        continue;
      }

      try {
        const originalPath = file.path;
        const ext = path.extname(file.filename);
        const nameWithoutExt = file.filename.replace(ext, '');
        const thumbnailFilename = `${nameWithoutExt}-thumb.webp`;
        const thumbnailPath = path.join(path.dirname(originalPath), thumbnailFilename);

        // Create thumbnail (300x300)
        await sharp(originalPath)
          .resize(300, 300, {
            fit: 'cover',
            position: 'center'
          })
          .webp({ quality: 80 })
          .toFile(thumbnailPath);

        // Store thumbnail info in request for later use
        if (!req.body.thumbnails) {
          req.body.thumbnails = [];
        }
        req.body.thumbnails.push(thumbnailFilename);
      } catch (thumbnailError) {
        console.error(`Error creating thumbnail for ${file.filename}:`, thumbnailError);
      }
    }

    next();
  } catch (error) {
    console.error('Thumbnail creation middleware error:', error);
    next();
  }
};
