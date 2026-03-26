// Entry point for Vercel serverless functions
import { VercelRequest, VercelResponse } from '@vercel/node';
import createApp from '../src/app';
import { Application } from 'express';

// Cache the app instance
let app: Application | null = null;

async function ensureApp(): Promise<Application> {
  // If app already exists, return it
  if (app) {
    return app;
  }

  // Create app (Supabase connection is handled in createApp)
  try {
    app = createApp();
    console.log('✅ Express app initialized for Vercel');
  } catch (error) {
    console.error('❌ Initialization error:', error);
    throw error;
  }

  return app;
}

// Export handler for Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const expressApp = await ensureApp();

    // Call Express app as a request handler
    expressApp(req as any, res as any);
  } catch (error: any) {
    console.error('❌ Handler error:', error);

    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}
