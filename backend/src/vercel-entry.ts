import dotenv from 'dotenv';
import { Application } from 'express';
import { connectDatabase } from './config/database';
import createApp from './app';

// Load environment variables
dotenv.config();

// Initialize database connection and create app
let appInstance: Application | null = null;
let dbConnected = false;

const getApp = async (): Promise<Application> => {
  if (!dbConnected) {
    try {
      await connectDatabase();
      dbConnected = true;
      console.log('✅ Database connected for Vercel serverless');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  if (!appInstance) {
    appInstance = createApp();
    console.log('✅ Express app created for Vercel serverless');
  }

  return appInstance;
};

// Export handler for Vercel
module.exports = async (req: any, res: any) => {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (error) {
    console.error('❌ Serverless function error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
