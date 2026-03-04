import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { morganStream } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/authRoutes';
import contactRoutes from './routes/contactRoutes';
import newsRoutes from './routes/newsRoutes';
import memberRoutes from './routes/memberRoutes';
import teamMemberRoutes from './routes/teamMemberRoutes';
import siteSettingsRoutes from './routes/siteSettingsRoutes';
import partnerRoutes from './routes/partnerRoutes';

// Create Express app
const createApp = (): Application => {
  const app: Application = express();

  // Middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.tailwindcss.com",
          "https://cdnjs.cloudflare.com",
          "https://code.iconify.design",
          "https://www.googletagmanager.com",
          "https://www.google-analytics.com",
          "https://googleads.g.doubleclick.net",
          "https://my.spline.design",
          "https://cdn.jsdelivr.net"
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://cdn.jsdelivr.net"
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https:",
          "http:"
        ],
        fontSrc: [
          "'self'",
          "data:",
          "https://fonts.gstatic.com"
        ],
        connectSrc: [
          "'self'",
          "http://localhost:3000",
          "http://localhost:9000",
          "http://localhost:5175",
          "https://www.google-analytics.com",
          "https://www.google.com",
          "https://analytics.google.com",
          "https://googleads.g.doubleclick.net"
        ],
        frameSrc: [
          "'self'",
          "https://my.spline.design",
          "https://www.googletagmanager.com"
        ]
      }
    }
  }));

  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  }));

  // HTTP request logging with Winston (skip in test environment)
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined', { stream: morganStream }));
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static files (uploaded images)
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // Serve static files (Frontend & Admin Panel)
  app.use('/admin', express.static(path.join(__dirname, '../public/admin')));
  app.use(express.static(path.join(__dirname, '../public')));

  // Favicon handler (prevent 404 errors)
  app.get('/favicon.ico', (_req: Request, res: Response) => {
    res.status(204).end();
  });

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      message: 'AURVA Backend API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/contacts', contactRoutes);
  app.use('/api/news', newsRoutes);
  app.use('/api/members', memberRoutes);
  app.use('/api/team', teamMemberRoutes);
  app.use('/api/settings', siteSettingsRoutes);
  app.use('/api/partners', partnerRoutes);

  // Root endpoint
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      message: 'AURVA Backend API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        auth: '/api/auth',
        contacts: '/api/contacts',
        news: '/api/news',
        members: '/api/members',
        team: '/api/team',
        settings: '/api/settings',
        partners: '/api/partners'
      }
    });
  });

  // Handle React Router for admin panel (must be AFTER API routes, BEFORE 404)
  // All admin panel routes should serve index.html for client-side routing
  app.get('/login', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/admin/index.html'));
  });

  app.get('/admin/*', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/admin/index.html'));
  });

  // 404 handler (must be after all routes)
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
};

export default createApp;
