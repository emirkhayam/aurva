// Entry point for Vercel serverless functions
import { Request, Response, Application } from 'express';
import createApp from '../src/app';
import { connectDatabase } from '../src/config/database';

// Lazy initialization
let appPromise: Promise<Application> | null = null;

async function getApp(): Promise<Application> {
  if (!appPromise) {
    appPromise = connectDatabase().then(() => {
      console.log('✅ Database connected for Vercel');
      return createApp();
    });
  }
  return appPromise;
}

// Export handler for Vercel
export default async function handler(req: Request, res: Response) {
  try {
    const app = await getApp();
    // Pass request to Express app
    return app(req, res);
  } catch (error: any) {
    console.error('❌ Handler error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
