import { Request, Response } from 'express';
import { getSupabaseClient } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';
import { UserProfile } from '../types/database.types';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const supabase = getSupabaseClient();

    // Authenticate with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.user) {
      console.error('Login error:', error);
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Load user profile from user_profiles table
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single<UserProfile>();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      res.status(403).json({ error: 'User profile not found' });
      return;
    }

    // Check if user is active
    if (!profile.is_active) {
      res.status(403).json({ error: 'Account is inactive' });
      return;
    }

    // Update last login
    // TODO: Fix TypeScript types issue with .update()
    // await supabase.from('user_profiles').update({ last_login: new Date().toISOString() }).eq('id', data.user.id);

    res.json({
      message: 'Login successful',
      token: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile.name,
        role: profile.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const supabase = getSupabaseClient();

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !profile) {
      console.error('Get profile error:', error);
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user: profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current and new passwords are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters long' });
      return;
    }

    const supabase = getSupabaseClient();

    // Verify current password by attempting to sign in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: req.user.email,
      password: currentPassword
    });

    if (verifyError) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    // Update password using Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      console.error('Change password error:', updateError);
      res.status(500).json({ error: 'Failed to update password' });
      return;
    }

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }

    const supabase = getSupabaseClient();

    // Refresh the session using Supabase Auth
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error || !data.session || !data.user) {
      console.error('Refresh token error:', error);
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    // Load user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single<UserProfile>();

    if (profileError || !profile || !profile.is_active) {
      res.status(401).json({ error: 'Invalid token or user inactive' });
      return;
    }

    res.json({
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile.name,
        role: profile.role
      }
    });
  } catch (error: any) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
