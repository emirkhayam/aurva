import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Database } from '../types/database.types';

// Only load .env file in local development (Vercel handles env vars automatically)
if (!process.env.VERCEL) {
  dotenv.config();
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Log environment variable status (for debugging)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables:', {
    SUPABASE_URL: supabaseUrl ? 'Set' : 'Missing',
    SUPABASE_ANON_KEY: supabaseAnonKey ? 'Set' : 'Missing',
    SUPABASE_SERVICE_KEY: supabaseServiceKey ? 'Set' : 'Missing'
  });
}

// Create default/fallback clients that will throw runtime errors if used without proper config
const defaultUrl = supabaseUrl || 'https://placeholder.supabase.co';
const defaultKey = supabaseAnonKey || 'placeholder-key';

// Typed Supabase client with anon key (for client-side operations)
export const supabase: SupabaseClient = createClient(
  defaultUrl,
  defaultKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
);

// Typed Supabase admin client with service role key (for server-side operations)
export const supabaseAdmin: SupabaseClient | null = supabaseServiceKey
  ? createClient(defaultUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Get the client to use (prefer admin for server operations)
export function getSupabaseClient(): SupabaseClient {
  return supabaseAdmin || supabase;
}

// Helper function to check Supabase connection with timeout
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const client = getSupabaseClient();

    // Create promise with timeout (5 seconds)
    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(false), 5000);
    });

    // Try to query user_profiles table as a health check
    const queryPromise = client.from('user_profiles').select('id').limit(1)
      .then(({ error }) => {
        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found (which is ok)
          console.warn('Supabase connection check failed:', error.message);
          return false;
        }
        return true;
      });

    // Race between timeout and query
    return await Promise.race([queryPromise, timeoutPromise]);
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
}

// Storage configuration
export const STORAGE_BUCKET = 'uploads';

// Helper function to get public URL for a file
export function getPublicUrl(bucketName: string, filePath: string): string {
  const client = getSupabaseClient();
  const { data } = client.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
}

// Helper function to upload file to Supabase Storage
export async function uploadToSupabase(
  file: Express.Multer.File,
  folder: string
): Promise<{ publicUrl: string; path: string }> {
  try {
    const client = getSupabaseClient();

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    console.log(`📤 Uploading file to Supabase Storage: ${filePath}`);

    // Upload file to Supabase Storage
    const { data, error } = await client.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('❌ Supabase upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    console.log(`✅ File uploaded successfully: ${data.path}`);

    // Get public URL
    const publicUrl = getPublicUrl(STORAGE_BUCKET, data.path);

    return {
      publicUrl,
      path: data.path
    };
  } catch (error: any) {
    console.error('❌ Error in uploadToSupabase:', error);
    throw error;
  }
}

// Helper function to delete file from Supabase Storage
export async function deleteFromSupabase(filePath: string): Promise<void> {
  try {
    const client = getSupabaseClient();

    console.log(`🗑️ Deleting file from Supabase Storage: ${filePath}`);

    const { error } = await client.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('❌ Supabase delete error:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }

    console.log(`✅ File deleted successfully: ${filePath}`);
  } catch (error: any) {
    console.error('❌ Error in deleteFromSupabase:', error);
    throw error;
  }
}

// Helper function to extract file path from Supabase URL
export function extractPathFromUrl(url: string | null): string | null {
  if (!url) return null;

  try {
    // Extract path from Supabase Storage public URL
    // Format: https://PROJECT.supabase.co/storage/v1/object/public/BUCKET/PATH
    const match = url.match(/\/object\/public\/[^/]+\/(.+)$/);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting path from URL:', error);
    return null;
  }
}

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any): string {
  if (error?.message) {
    return error.message;
  }
  if (error?.error_description) {
    return error.error_description;
  }
  return 'An unexpected error occurred';
}

// Pagination helper
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export function getPaginationRange(options: PaginationOptions = {}): { from: number; to: number } {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { from, to };
}

// Slug generation helper (for news, members, partners)
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^а-яёa-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

export default supabase;
