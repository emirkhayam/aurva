import { Request, Response, NextFunction } from 'express';
import { uploadToSupabase, deleteFromSupabase } from '../config/supabase';

// Extend Express Request to include supabase upload info
declare global {
  namespace Express {
    interface Request {
      supabaseFile?: {
        publicUrl: string;
        path: string;
      };
      supabaseFiles?: Array<{
        publicUrl: string;
        path: string;
        fieldname: string;
        originalname: string;
      }>;
    }
  }
}

/**
 * Middleware to upload single file to Supabase Storage
 * Use after multer middleware
 */
export const uploadSingleToSupabase = (folder: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return next();
      }

      console.log(`=ä Processing single file upload to folder: ${folder}`);

      const result = await uploadToSupabase(req.file, folder);

      req.supabaseFile = result;

      console.log(` Single file uploaded: ${result.publicUrl}`);

      next();
    } catch (error: any) {
      console.error('L Error uploading file to Supabase:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload file',
        error: error.message
      });
    }
  };
};

/**
 * Middleware to upload multiple files to Supabase Storage
 * Use after multer middleware
 */
export const uploadMultipleToSupabase = (folder: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return next();
      }

      console.log(`=ä Processing ${req.files.length} files upload to folder: ${folder}`);

      const uploadPromises = req.files.map(async (file) => {
        const result = await uploadToSupabase(file, folder);
        return {
          ...result,
          fieldname: file.fieldname,
          originalname: file.originalname
        };
      });

      req.supabaseFiles = await Promise.all(uploadPromises);

      console.log(` ${req.supabaseFiles.length} files uploaded successfully`);

      next();
    } catch (error: any) {
      console.error('L Error uploading files to Supabase:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload files',
        error: error.message
      });
    }
  };
};

/**
 * Helper function to delete file from Supabase Storage
 * Call this when deleting records with associated files
 */
export async function deleteSupabaseFile(imageUrl: string): Promise<void> {
  try {
    // Extract the path from the public URL
    // Format: https://supabasekong-xxx.aurva.kg/storage/v1/object/public/uploads/folder/filename.ext
    const match = imageUrl.match(/\/storage\/v1\/object\/public\/uploads\/(.+)$/);

    if (!match) {
      console.warn(`  Could not extract path from URL: ${imageUrl}`);
      return;
    }

    const filePath = match[1];
    await deleteFromSupabase(filePath);
  } catch (error: any) {
    console.error('L Error deleting file from Supabase:', error);
    // Don't throw error - file deletion should not block other operations
  }
}
