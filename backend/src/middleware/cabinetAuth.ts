import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient } from '../config/supabase';

export interface CabinetAuthRequest extends Request {
  clientUser?: {
    id: string;
    email: string;
    full_name: string;
    phone: string | null;
    company_name: string | null;
    avatar_url: string | null;
  };
}

/**
 * Middleware to authenticate cabinet (client) users via Supabase Auth JWT.
 * Checks client_profiles table instead of user_profiles.
 */
export const authenticateClient = async (
  req: CabinetAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const supabase = getSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      res.status(403).json({ error: 'Client profile not found' });
      return;
    }

    if (!profile.is_active) {
      res.status(403).json({ error: 'Account is inactive' });
      return;
    }

    req.clientUser = {
      id: user.id,
      email: user.email || profile.email,
      full_name: profile.full_name,
      phone: profile.phone,
      company_name: profile.company_name,
      avatar_url: profile.avatar_url,
    };

    next();
  } catch (error) {
    console.error('Cabinet auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
