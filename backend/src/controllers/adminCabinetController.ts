import { Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { AuthRequest } from '../middleware/auth';

// Create a fresh service_role client for each admin operation to avoid RLS issues
// The shared singleton gets its session changed by auth middleware's getUser() call
function getAdminClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_KEY!;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

// ==================== CLIENTS ====================

export const getClients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, page = 1, limit = 10, is_active } = req.query;
    const supabase = getAdminClient();

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('client_profiles')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%`);
    }

    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data: clients, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) {
      console.error('Get clients error:', error);
      res.status(500).json({ error: 'Failed to fetch clients' });
      return;
    }

    res.json({
      clients: clients || [],
      pagination: {
        total: count || 0,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil((count || 0) / limitNum)
      }
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getClientById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const supabase = getAdminClient();

    const { data: client, error } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !client) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    res.json({ client });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { is_active, full_name, phone, company_name } = req.body;
    const supabase = getAdminClient();

    // Check if client exists
    const { data: existing, error: fetchError } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    const updates: Record<string, any> = {};
    if (is_active !== undefined) updates.is_active = is_active;
    if (full_name !== undefined) updates.full_name = full_name;
    if (phone !== undefined) updates.phone = phone;
    if (company_name !== undefined) updates.company_name = company_name;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    const { data: client, error } = await supabase
      .from('client_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update client error:', error);
      res.status(500).json({ error: 'Failed to update client' });
      return;
    }

    res.json({ message: 'Client updated successfully', client });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const supabase = getAdminClient();

    // Check if client exists
    const { data: existing, error: fetchError } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    // Delete client profile
    const { error: deleteError } = await supabase
      .from('client_profiles')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete client error:', deleteError);
      res.status(500).json({ error: 'Failed to delete client' });
      return;
    }

    // Delete auth user
    await supabase.auth.admin.deleteUser(id);

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==================== COURSES ====================

export const getCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const supabase = getAdminClient();

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const { data: courses, error, count } = await supabase
      .from('courses')
      .select('*', { count: 'exact' })
      .order('display_order', { ascending: true })
      .range(offset, offset + limitNum - 1);

    if (error) {
      console.error('Get courses error:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
      return;
    }

    res.json({
      courses: courses || [],
      pagination: {
        total: count || 0,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil((count || 0) / limitNum)
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, slug, description, image_url, is_published, display_order } = req.body;
    const supabase = getAdminClient();

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        title,
        slug: slug || null,
        description: description || null,
        image_url: image_url || null,
        is_published: is_published ?? false,
        display_order: display_order ?? 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Create course error:', error);
      res.status(500).json({ error: 'Failed to create course' });
      return;
    }

    res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCourseById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const supabase = getAdminClient();

    const { data: course, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    res.json({ course });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, slug, description, image_url, is_published, display_order } = req.body;
    const supabase = getAdminClient();

    // Check if course exists
    const { data: existing, error: fetchError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    const updates: Record<string, any> = {};
    if (title !== undefined) updates.title = title;
    if (slug !== undefined) updates.slug = slug;
    if (description !== undefined) updates.description = description;
    if (image_url !== undefined) updates.image_url = image_url;
    if (is_published !== undefined) updates.is_published = is_published;
    if (display_order !== undefined) updates.display_order = display_order;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    const { data: course, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update course error:', error);
      res.status(500).json({ error: 'Failed to update course' });
      return;
    }

    res.json({ message: 'Course updated successfully', course });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const supabase = getAdminClient();

    // Check if course exists
    const { data: existing, error: fetchError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    // Delete lessons first
    await supabase
      .from('course_lessons')
      .delete()
      .eq('course_id', id);

    // Delete course
    const { error: deleteError } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete course error:', deleteError);
      res.status(500).json({ error: 'Failed to delete course' });
      return;
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==================== LESSONS ====================

export const getLessons = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const supabase = getAdminClient();

    // Check if course exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', id)
      .single();

    if (courseError || !course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    const { data: lessons, error } = await supabase
      .from('course_lessons')
      .select('*')
      .eq('course_id', id)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Get lessons error:', error);
      res.status(500).json({ error: 'Failed to fetch lessons' });
      return;
    }

    res.json({ lessons: lessons || [] });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // course_id
    const { title, content, video_url, display_order, is_published } = req.body;
    const supabase = getAdminClient();

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    // Check if course exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', id)
      .single();

    if (courseError || !course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    const { data: lesson, error } = await supabase
      .from('course_lessons')
      .insert({
        course_id: id,
        title,
        content: content || null,
        video_url: video_url || null,
        display_order: display_order ?? 0,
        is_published: is_published ?? false,
      })
      .select()
      .single();

    if (error) {
      console.error('Create lesson error:', error);
      res.status(500).json({ error: 'Failed to create lesson' });
      return;
    }

    res.status(201).json({ message: 'Lesson created successfully', lesson });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // lesson_id
    const { title, content, video_url, display_order, is_published } = req.body;
    const supabase = getAdminClient();

    // Check if lesson exists
    const { data: existing, error: fetchError } = await supabase
      .from('course_lessons')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    const updates: Record<string, any> = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (video_url !== undefined) updates.video_url = video_url;
    if (display_order !== undefined) updates.display_order = display_order;
    if (is_published !== undefined) updates.is_published = is_published;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    const { data: lesson, error } = await supabase
      .from('course_lessons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update lesson error:', error);
      res.status(500).json({ error: 'Failed to update lesson' });
      return;
    }

    res.json({ message: 'Lesson updated successfully', lesson });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // lesson_id
    const supabase = getAdminClient();

    // Check if lesson exists
    const { data: existing, error: fetchError } = await supabase
      .from('course_lessons')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    const { error: deleteError } = await supabase
      .from('course_lessons')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete lesson error:', deleteError);
      res.status(500).json({ error: 'Failed to delete lesson' });
      return;
    }

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==================== USER COURSE MANAGEMENT ====================

export const assignCourseToUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, courseId } = req.body;
    const supabase = getAdminClient();

    if (!userId || !courseId) {
      res.status(400).json({ error: 'User ID and Course ID are required' });
      return;
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('client_profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if course exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    // Check if already assigned
    const { data: existing } = await supabase
      .from('user_course_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (existing) {
      res.status(409).json({ error: 'Course already assigned to this user' });
      return;
    }

    // Assign course
    const { data: progress, error } = await supabase
      .from('user_course_progress')
      .insert({
        user_id: userId,
        course_id: courseId,
        status: 'not_started',
        progress_percent: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Assign course error:', error);
      res.status(500).json({ error: 'Failed to assign course' });
      return;
    }

    res.status(201).json({ message: 'Course assigned successfully', progress });
  } catch (error) {
    console.error('Assign course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const unassignCourseFromUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, courseId } = req.params;
    const supabase = getAdminClient();

    // Check if assignment exists
    const { data: existing, error: fetchError } = await supabase
      .from('user_course_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (fetchError || !existing) {
      res.status(404).json({ error: 'Course assignment not found' });
      return;
    }

    // Delete assignment
    const { error: deleteError } = await supabase
      .from('user_course_progress')
      .delete()
      .eq('user_id', userId)
      .eq('course_id', courseId);

    if (deleteError) {
      console.error('Unassign course error:', deleteError);
      res.status(500).json({ error: 'Failed to unassign course' });
      return;
    }

    res.json({ message: 'Course unassigned successfully' });
  } catch (error) {
    console.error('Unassign course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const supabase = getAdminClient();

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('client_profiles')
      .select('id, full_name, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get user's courses with progress
    const { data: progress, error } = await supabase
      .from('user_course_progress')
      .select(`
        *,
        courses (
          id,
          title,
          slug,
          description,
          image_url,
          is_published,
          display_order
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get user courses error:', error);
      res.status(500).json({ error: 'Failed to fetch user courses' });
      return;
    }

    res.json({
      user,
      courses: progress || [],
    });
  } catch (error) {
    console.error('Get user courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllUsersWithCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const supabase = getAdminClient();

    // Get all clients with their course count
    const { data: clients, error: clientsError } = await supabase
      .from('client_profiles')
      .select('id, full_name, email, is_active')
      .order('full_name', { ascending: true });

    if (clientsError) {
      console.error('Get clients error:', clientsError);
      res.status(500).json({ error: 'Failed to fetch clients' });
      return;
    }

    // Get course counts for each user
    const clientsWithCourses = await Promise.all(
      (clients || []).map(async (client) => {
        const { count } = await supabase
          .from('user_course_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', client.id);

        return {
          ...client,
          coursesCount: count || 0,
        };
      })
    );

    res.json({ clients: clientsWithCourses });
  } catch (error) {
    console.error('Get all users with courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==================== STATS ====================

export const getStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const supabase = getAdminClient();

    // Get total clients
    const { count: totalClients } = await supabase
      .from('client_profiles')
      .select('*', { count: 'exact', head: true });

    // Get active clients
    const { count: activeClients } = await supabase
      .from('client_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get total courses
    const { count: totalCourses } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true });

    // Get published courses
    const { count: publishedCourses } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    // Get total lessons
    const { count: totalLessons } = await supabase
      .from('course_lessons')
      .select('*', { count: 'exact', head: true });

    // Get published lessons
    const { count: publishedLessons } = await supabase
      .from('course_lessons')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    res.json({
      stats: {
        clients: {
          total: totalClients || 0,
          active: activeClients || 0,
        },
        courses: {
          total: totalCourses || 0,
          published: publishedCourses || 0,
        },
        lessons: {
          total: totalLessons || 0,
          published: publishedLessons || 0,
        },
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
