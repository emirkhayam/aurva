import { Response } from 'express';
import { getSupabaseClient } from '../config/supabase';
import { CabinetAuthRequest } from '../middleware/cabinetAuth';

/**
 * Mark a lesson as complete for the user
 */
export const markLessonComplete = async (req: CabinetAuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.clientUser?.id;
    const { lessonId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const supabase = getSupabaseClient();

    // Upsert lesson progress
    const { data, error } = await supabase
      .from('user_lesson_progress')
      .upsert(
        {
          user_id: userId,
          lesson_id: Number(lessonId),
          is_completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,lesson_id' }
      )
      .select()
      .single();

    if (error) throw error;

    // Calculate course progress
    const courseProgress = await calculateCourseProgressForLesson(supabase, userId, Number(lessonId));

    res.json({
      success: true,
      data,
      courseProgress,
    });
  } catch (error: any) {
    console.error('Error marking lesson complete:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Unmark lesson as complete
 */
export const markLessonIncomplete = async (req: CabinetAuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.clientUser?.id;
    const { lessonId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('user_lesson_progress')
      .upsert(
        {
          user_id: userId,
          lesson_id: Number(lessonId),
          is_completed: false,
          completed_at: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,lesson_id' }
      )
      .select()
      .single();

    if (error) throw error;

    const courseProgress = await calculateCourseProgressForLesson(supabase, userId, Number(lessonId));

    res.json({
      success: true,
      data,
      courseProgress,
    });
  } catch (error: any) {
    console.error('Error unmarking lesson:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get progress for all lessons in a course
 */
export const getLessonProgress = async (req: CabinetAuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.clientUser?.id;
    const { courseId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const supabase = getSupabaseClient();

    // Get all modules for this course
    const { data: modules, error: modulesError } = await supabase
      .from('course_modules')
      .select('id')
      .eq('course_id', Number(courseId));

    if (modulesError) throw modulesError;

    if (!modules || modules.length === 0) {
      res.json({
        success: true,
        data: {
          lessons: [],
          totalLessons: 0,
          completedLessons: 0,
          progressPercentage: 0,
        },
      });
      return;
    }

    const moduleIds = modules.map((m: any) => m.id);

    // Get all lessons
    const { data: lessons, error: lessonsError } = await supabase
      .from('course_lessons')
      .select('id, title, module_id, order_index')
      .in('module_id', moduleIds)
      .order('order_index', { ascending: true });

    if (lessonsError) throw lessonsError;

    const lessonIds = (lessons || []).map((l: any) => l.id);

    // Get progress for these lessons
    let progress: any[] = [];
    if (lessonIds.length > 0) {
      const { data: progressData, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .in('lesson_id', lessonIds);

      if (progressError) throw progressError;
      progress = progressData || [];
    }

    // Merge lessons with progress
    const lessonsWithProgress = (lessons || []).map((lesson: any) => {
      const lessonProgress = progress.find((p: any) => p.lesson_id === lesson.id);
      return {
        ...lesson,
        is_completed: lessonProgress?.is_completed || false,
        completed_at: lessonProgress?.completed_at || null,
        last_watched_position: lessonProgress?.last_watched_position || 0,
      };
    });

    const completedCount = lessonsWithProgress.filter((l: any) => l.is_completed).length;
    const totalCount = lessonsWithProgress.length;
    const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    res.json({
      success: true,
      data: {
        lessons: lessonsWithProgress,
        totalLessons: totalCount,
        completedLessons: completedCount,
        progressPercentage,
      },
    });
  } catch (error: any) {
    console.error('Error fetching lesson progress:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update video watch position
 */
export const updateWatchPosition = async (req: CabinetAuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.clientUser?.id;
    const { lessonId } = req.params;
    const { position } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (position === undefined || position === null) {
      res.status(400).json({ success: false, error: 'position is required' });
      return;
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('user_lesson_progress')
      .upsert(
        {
          user_id: userId,
          lesson_id: Number(lessonId),
          last_watched_position: Number(position),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,lesson_id' }
      )
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error updating watch position:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Helper: calculate course progress % for a given lesson's course
 */
async function calculateCourseProgressForLesson(
  supabase: any,
  userId: string,
  lessonId: number
): Promise<{ courseId: number; totalLessons: number; completedLessons: number; progressPercentage: number } | null> {
  try {
    // Find the course for this lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('course_lessons')
      .select('id, module_id')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) return null;

    const { data: module, error: moduleError } = await supabase
      .from('course_modules')
      .select('id, course_id')
      .eq('id', lesson.module_id)
      .single();

    if (moduleError || !module) return null;

    const courseId = module.course_id;

    // Get all modules for this course
    const { data: courseModules, error: cmError } = await supabase
      .from('course_modules')
      .select('id')
      .eq('course_id', courseId);

    if (cmError) return null;

    const moduleIds = (courseModules || []).map((m: any) => m.id);

    // Get all lessons
    const { data: allLessons, error: lessonsError } = await supabase
      .from('course_lessons')
      .select('id')
      .in('module_id', moduleIds);

    if (lessonsError) return null;

    const lessonIds = (allLessons || []).map((l: any) => l.id);

    // Get completed count
    const { count, error: countError } = await supabase
      .from('user_lesson_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_completed', true)
      .in('lesson_id', lessonIds);

    if (countError) return null;

    const totalLessons = lessonIds.length;
    const completedLessons = count || 0;
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return { courseId, totalLessons, completedLessons, progressPercentage };
  } catch {
    return null;
  }
}
