// Entry point for Vercel serverless functions
import { VercelRequest, VercelResponse } from '@vercel/node';
import { Application } from 'express';

// Cache the app instance
let app: Application | null = null;
let initError: any = null;

async function ensureApp(): Promise<Application> {
  // If app already exists, return it
  if (app) {
    return app;
  }

  // If initialization failed before, throw the cached error
  if (initError) {
    throw initError;
  }

  // Try to create app and capture detailed error info
  try {
    console.log('🔄 Attempting to import createApp...');
    const createApp = require('../src/app').default;

    console.log('🔄 Attempting to create Express app...');
    app = createApp();

    console.log('✅ Express app initialized successfully for Vercel');
    return app;
  } catch (error: any) {
    initError = error;
    console.error('❌ Initialization error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    throw error;
  }
}

// Export handler for Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('📥 Request:', req.method, req.url);

    const expressApp = await ensureApp();

    // Call Express app as a request handler
    expressApp(req as any, res as any);
  } catch (error: any) {
    console.error('❌ Handler error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'Unknown error',
        stack: error.stack,
        type: error.name,
        details: 'Check Vercel function logs for more details'
      });
    }
  }
}
