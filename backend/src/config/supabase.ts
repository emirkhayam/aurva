import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL environment variable is required');
}

if (!supabaseAnonKey) {
  throw new Error('SUPABASE_ANON_KEY environment variable is required');
}

// Supabase client with anon key (for client-side operations)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Supabase admin client with service role key (for server-side operations)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Helper function to check Supabase connection
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('_health').select('*').limit(1);
    if (error && error.code !== 'PGRST204') {
      console.warn('Supabase connection check failed:', error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
}

// Storage configuration
export const STORAGE_BUCKET = 'uploads';

// Helper function to get public URL for a file
export function getPublicUrl(bucketName: string, filePath: string): string {
  const client = supabaseAdmin || supabase;
  const { data } = client.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
}

// Helper function to upload file to Supabase Storage
export async function uploadToSupabase(
  file: Express.Multer.File,
  folder: string
): Promise<{ publicUrl: string; path: string }> {
  try {
    const client = supabaseAdmin || supabase;

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
    const client = supabaseAdmin || supabase;

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

export default supabase;
