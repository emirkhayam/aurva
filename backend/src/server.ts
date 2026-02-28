import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import logger from './utils/logger';
import createApp from './app';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Create Express app
const app = createApp();

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start listening
    app.listen(PORT, () => {
      logger.info(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 AURVA Backend API Server Started                    ║
║                                                           ║
║   Port: ${PORT}                                          ║
║   Environment: ${process.env.NODE_ENV || 'development'}                                 ║
║   Database: Connected ✅                                  ║
║                                                           ║
║   Endpoints:                                              ║
║   - Health Check:  http://localhost:${PORT}/health        ║
║   - Auth:          http://localhost:${PORT}/api/auth      ║
║   - Contacts:      http://localhost:${PORT}/api/contacts  ║
║   - News:          http://localhost:${PORT}/api/news      ║
║   - Members:       http://localhost:${PORT}/api/members   ║
║   - Team:          http://localhost:${PORT}/api/team      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Start the server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
}
