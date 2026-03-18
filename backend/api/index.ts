// Entry point for Vercel serverless functions
import { VercelRequest, VercelResponse } from '@vercel/node';
import createApp from '../src/app';
import { connectDatabase } from '../src/config/database';
import { Application } from 'express';

// Cache the app instance
let app: Application | null = null;
let isConnecting = false;
let connectionPromise: Promise<void> | null = null;

async function ensureApp(): Promise<Application> {
  // If app already exists, return it
  if (app) {
    return app;
  }

  // If connection is in progress, wait for it
  if (isConnecting && connectionPromise) {
    await connectionPromise;
    if (app) return app;
  }

  // Start new connection
  isConnecting = true;
  connectionPromise = (async () => {
    try {
      await connectDatabase();
      console.log('✅ Database connected for Vercel');
      app = createApp();
      console.log('✅ Express app initialized');
    } catch (error) {
      console.error('❌ Initialization error:', error);
      throw error;
    } finally {
      isConnecting = false;
    }
  })();

  await connectionPromise;

  if (!app) {
    throw new Error('Failed to initialize app');
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
