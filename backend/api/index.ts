// Entry point for Vercel serverless functions
import { VercelRequest, VercelResponse } from '@vercel/node';

// Temporary simple handler for debugging
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('Handler called:', req.url);

    res.status(200).json({
      status: 'ok',
      message: 'AURVA Backend API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      vercel: process.env.VERCEL || 'false',
      url: req.url,
      method: req.method
    });
  } catch (error: any) {
    console.error('❌ Handler error:', error);

    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
