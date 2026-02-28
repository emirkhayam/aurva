import rateLimit from 'express-rate-limit';

// Skip rate limiting in test environment
const skip = () => process.env.NODE_ENV === 'test';

/**
 * General API rate limiter
 * Limits: 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip,
});

/**
 * Strict rate limiter for authentication endpoints
 * Limits: 5 login attempts per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many login attempts, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skip,
});

/**
 * Contact form rate limiter
 * Limits: 3 submissions per hour per IP
 */
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 contact form submissions per hour
  message: {
    error: 'Too many contact form submissions, please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip,
});

/**
 * Create/Update operations rate limiter
 * Limits: 20 write operations per 5 minutes
 */
export const createLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit to 20 create/update operations
  message: {
    error: 'Too many operations, please try again in a few minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip,
});
