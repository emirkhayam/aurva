import { Request, Response } from 'express';
import { getSupabaseClient } from '../config/supabase';
import { CabinetAuthRequest } from '../middleware/cabinetAuth';

// ==================== AUTH ====================

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, full_name, phone, company_name } = req.body;

    if (!email || !password || !full_name) {
      res.status(400).json({ error: 'Email, password and full name are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const supabase = getSupabaseClient();

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, role: 'client' }
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        res.status(409).json({ error: 'User with this email already exists' });
        return;
      }
      console.error('Registration auth error:', authError);
      res.status(400).json({ error: authError.message });
      return;
    }

    if (!authData.user) {
      res.status(500).json({ error: 'Failed to create user' });
      return;
    }

    // Create client profile
    const { error: profileError } = await supabase
      .from('client_profiles')
      .insert({
        id: authData.user.id,
        email,
        full_name,
        phone: phone || null,
        company_name: company_name || null,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      res.status(500).json({ error: 'Failed to create profile' });
      return;
    }

    res.status(201).json({
      message: 'Registration successful',
      token: authData.session?.access_token,
      refreshToken: authData.session?.refresh_token,
      user: {
        id: authData.user.id,
        email,
        full_name,
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Load client profile
    const { data: profile, error: profileError } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      res.status(403).json({ error: 'Client profile not found. Are you registered as a client?' });
      return;
    }

    if (!profile.is_active) {
      res.status(403).json({ error: 'Account is inactive' });
      return;
    }

    // Update last login
    await supabase
      .from('client_profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.user.id);

    res.json({
      message: 'Login successful',
      token: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: profile.full_name,
        phone: profile.phone,
        company_name: profile.company_name,
        avatar_url: profile.avatar_url,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
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

    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

    if (error || !data.session || !data.user) {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    const { data: profile } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (!profile || !profile.is_active) {
      res.status(401).json({ error: 'Invalid token or user inactive' });
      return;
    }

    res.json({
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: profile.full_name,
        phone: profile.phone,
        company_name: profile.company_name,
        avatar_url: profile.avatar_url,
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==================== PROFILE ====================

export const getProfile = async (req: CabinetAuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.clientUser) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const supabase = getSupabaseClient();

    const { data: profile, error } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('id', req.clientUser.id)
      .single();

    if (error || !profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    res.json({ user: profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req: CabinetAuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.clientUser) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { full_name, phone, company_name } = req.body;

    const supabase = getSupabaseClient();

    const updates: Record<string, any> = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (phone !== undefined) updates.phone = phone;
    if (company_name !== undefined) updates.company_name = company_name;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    const { data: profile, error } = await supabase
      .from('client_profiles')
      .update(updates)
      .eq('id', req.clientUser.id)
      .select()
      .single();

    if (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
      return;
    }

    res.json({ message: 'Profile updated', user: profile });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const changePassword = async (req: CabinetAuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.clientUser) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current and new passwords are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters' });
      return;
    }

    const supabase = getSupabaseClient();

    // Verify current password
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: req.clientUser.email,
      password: currentPassword
    });

    if (verifyError) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    if (updateError) {
      res.status(500).json({ error: 'Failed to update password' });
      return;
    }

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==================== COURSES ====================

export const getCourses = async (_req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabaseClient();

    const { data: courses, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Get courses error:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
      return;
    }

    res.json({ courses: courses || [] });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCourseBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const supabase = getSupabaseClient();

    const { data: course, error } = await supabase
      .from('courses')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error || !course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    // Get lessons
    const { data: lessons } = await supabase
      .from('course_lessons')
      .select('id, title, display_order, is_published')
      .eq('course_id', course.id)
      .eq('is_published', true)
      .order('display_order', { ascending: true });

    res.json({ course, lessons: lessons || [] });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserProgress = async (req: CabinetAuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.clientUser) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const supabase = getSupabaseClient();

    const { data: progress, error } = await supabase
      .from('user_course_progress')
      .select('*, courses(*)')
      .eq('user_id', req.clientUser.id);

    if (error) {
      console.error('Get progress error:', error);
      res.status(500).json({ error: 'Failed to fetch progress' });
      return;
    }

    res.json({ progress: progress || [] });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
