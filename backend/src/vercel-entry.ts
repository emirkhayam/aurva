import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import createApp from './app';

// Load environment variables
dotenv.config();

// Connect to database and export app
let app: any;

const initialize = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Create Express app
    app = createApp();

    console.log('✅ Vercel serverless function initialized');
    return app;
  } catch (error) {
    console.error('❌ Failed to initialize:', error);
    throw error;
  }
};

// Initialize and export
export default async (req: any, res: any) => {
  if (!app) {
    app = await initialize();
  }
  return app(req, res);
};
