import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient } from '../config/supabase';
import { UserProfile } from '../types/database.types';

export interface AuthRequest extends Request {
  user?: {
    id: string; // UUID instead of number
    email: string;
    role: 'admin' | 'moderator';
    profile: UserProfile;
  };
}

/**
 * Middleware to authenticate requests using Supabase Auth JWT
 * Verifies the Bearer token and loads user profile
 */
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const supabase = getSupabaseClient();

    // Verify token with Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }

    // Load user profile from user_profiles table
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single<UserProfile>();

    if (profileError || !profile) {
      res.status(403).json({ error: 'User profile not found' });
      return;
    }

    // Check if user is active
    if (!profile.is_active) {
      res.status(403).json({ error: 'User account is inactive' });
      return;
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email || profile.email,
      role: profile.role,
      profile: profile
    };

    next();
  } catch (error: any) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Middleware to require admin role
 * Must be used after authenticateToken
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
};

/**
 * Middleware to require admin or moderator role
 * Must be used after authenticateToken
 */
export const requireAdminOrModerator = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'moderator') {
    res.status(403).json({ error: 'Admin or moderator access required' });
    return;
  }
  next();
};

/**
 * Optional authentication - doesn't fail if no token provided
 * Useful for endpoints that work for both authenticated and anonymous users
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // No token provided, continue without user
      next();
      return;
    }

    const supabase = getSupabaseClient();

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (!error && user) {
      // Token is valid, load profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single<UserProfile>();

      if (profile && profile.is_active) {
        req.user = {
          id: user.id,
          email: user.email || profile.email,
          role: profile.role,
          profile: profile
        };
      }
    }

    next();
  } catch (error) {
    // Ignore errors in optional auth
    next();
  }
};

// Alias for authenticateToken
export const authenticate = authenticateToken;

/**
 * Role-based authorization middleware
 * @param roles - Array of allowed roles
 */
export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};
