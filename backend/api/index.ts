import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDatabase } from '../src/config/database';
import createApp from '../src/app';
import { Application } from 'express';

let app: Application | null = null;
let dbInitialized = false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Initialize database once
    if (!dbInitialized) {
      await connectDatabase();
      dbInitialized = true;
      console.log('✅ Database initialized');
    }

    // Create app instance once
    if (!app) {
      app = createApp();
      console.log('✅ App initialized');
    }

    // Handle request
    return app(req as any, res as any);
  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
