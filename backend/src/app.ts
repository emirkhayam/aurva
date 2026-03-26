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
import cabinetRoutes from './routes/cabinetRoutes';
import adminCabinetRoutes from './routes/adminCabinetRoutes';
import coursesRoutes from './routes/courses';

// Create Express app
const createApp = (): Application => {
  const app: Application = express();

  // Trust proxy - required for rate limiting behind nginx/Cloudflare
  // This allows Express to correctly identify client IPs from X-Forwarded-For header
  app.set('trust proxy', true);

  // Middleware
  // Disable CSP upgrade-insecure-requests in development to allow HTTP on localhost
  const isDev = process.env.NODE_ENV === 'development';

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
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com"
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
          "https://fonts.gstatic.com",
          "https://cdnjs.cloudflare.com"
        ],
        connectSrc: [
          "'self'",
          "http://localhost:3000",
          "http://localhost:9000",
          "http://localhost:5175",
          "https://www.google-analytics.com",
          "https://www.google.com",
          "https://analytics.google.com",
          "https://googleads.g.doubleclick.net",
          "https://*.supabase.co"
        ],
        frameSrc: [
          "'self'",
          "https://my.spline.design",
          "https://www.googletagmanager.com"
        ],
        scriptSrcAttr: ["'unsafe-inline'"],
        upgradeInsecureRequests: isDev ? null : []
      }
    }
  }));

  // CORS configuration - handle multiple origins
  const corsOrigin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : '*';

  app.use(cors({
    origin: corsOrigin,
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

  // Helper function to disable caching for HTML files
  const sendHtmlNoCaching = (res: Response, filePath: string) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(filePath);
  };

  // Clean URLs without .html extension (must be before API routes)
  app.get('/', (_req: Request, res: Response) => {
    sendHtmlNoCaching(res, path.join(__dirname, '../public/index.html'));
  });

  app.get('/news', (_req: Request, res: Response) => {
    sendHtmlNoCaching(res, path.join(__dirname, '../public/news.html'));
  });

  app.get('/about', (_req: Request, res: Response) => {
    sendHtmlNoCaching(res, path.join(__dirname, '../public/about.html'));
  });

  app.get('/about-us-2', (_req: Request, res: Response) => {
    sendHtmlNoCaching(res, path.join(__dirname, '../public/about-us-2.html'));
  });

  app.get('/generated-page', (_req: Request, res: Response) => {
    sendHtmlNoCaching(res, path.join(__dirname, '../public/generated-page.html'));
  });

  app.get('/courses', (_req: Request, res: Response) => {
    sendHtmlNoCaching(res, path.join(__dirname, '../public/courses.html'));
  });

  // Cabinet pages (SPA-like, all served from cabinet.html)
  app.get('/cabinet', (_req: Request, res: Response) => {
    sendHtmlNoCaching(res, path.join(__dirname, '../public/cabinet.html'));
  });
  app.get('/cabinet/login', (_req: Request, res: Response) => {
    sendHtmlNoCaching(res, path.join(__dirname, '../public/cabinet.html'));
  });
  app.get('/cabinet/register', (_req: Request, res: Response) => {
    sendHtmlNoCaching(res, path.join(__dirname, '../public/cabinet.html'));
  });
  app.get('/cabinet/profile', (_req: Request, res: Response) => {
    sendHtmlNoCaching(res, path.join(__dirname, '../public/cabinet.html'));
  });
  app.get('/cabinet/courses', (_req: Request, res: Response) => {
    sendHtmlNoCaching(res, path.join(__dirname, '../public/cabinet.html'));
  });
  app.get('/cabinet/courses/:slug', (_req: Request, res: Response) => {
    sendHtmlNoCaching(res, path.join(__dirname, '../public/cabinet.html'));
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
  app.use('/api/cabinet', cabinetRoutes);
  app.use('/api/admin/cabinet', adminCabinetRoutes);
  app.use('/api/courses', coursesRoutes);

  // API info endpoint (for debugging)
  app.get('/api', (_req: Request, res: Response) => {
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
        partners: '/api/partners',
        cabinet: '/api/cabinet',
        adminCabinet: '/api/admin/cabinet',
        courses: '/api/courses'
      }
    });
  });

  // Handle React Router for admin panel (must be AFTER API routes, BEFORE 404)
  // All admin panel routes should serve index.html for client-side routing
  app.get('/login', (_req: Request, res: Response) => {
    sendHtmlNoCaching(res, path.join(__dirname, '../public/admin/index.html'));
  });

  app.get('/admin/*', (_req: Request, res: Response) => {
    sendHtmlNoCaching(res, path.join(__dirname, '../public/admin/index.html'));
  });

  // 404 handler (must be after all routes)
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
};

export default createApp;
