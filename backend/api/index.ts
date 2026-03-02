// Entry point for Vercel serverless functions
import { Request, Response } from 'express';
import createApp from '../src/app';
import { connectDatabase } from '../src/config/database';

// Lazy initialization
let appPromise: Promise<any> | null = null;

function getApp() {
  if (!appPromise) {
    appPromise = connectDatabase().then(() => {
      console.log('✅ Database connected for Vercel');
      return createApp();
    });
  }
  return appPromise;
}

// Export handler for Vercel
export default function handler(req: Request, res: Response) {
  return getApp().then((app) => app(req, res)).catch((error: any) => {
    console.error('❌ Handler error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  });
}
