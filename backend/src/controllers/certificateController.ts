import { Request, Response } from 'express';
import { getSupabaseClient } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';
import { CabinetAuthRequest } from '../middleware/cabinetAuth';

/**
 * Generate a unique certificate number: AURVA-YYYY-NNNNN
 */
function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000); // 5-digit random
  return `AURVA-${year}-${random}`;
}

/**
 * Generate certificate when course is 100% complete
 */
export const generateCertificate = async (req: CabinetAuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.clientUser?.id;
    const { course_id } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (!course_id) {
      res.status(400).json({ success: false, error: 'course_id is required' });
      return;
    }

    const supabase = getSupabaseClient();

    // Check if certificate already exists
    const { data: existing, error: existError } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', Number(course_id))
      .maybeSingle();

    if (existError) throw existError;

    if (existing) {
      res.json({ success: true, data: existing, message: 'Certificate already issued' });
      return;
    }

    // Verify course completion: get all lessons in the course
    const { data: modules, error: modulesError } = await supabase
      .from('course_modules')
      .select('id')
      .eq('course_id', Number(course_id));

    if (modulesError) throw modulesError;

    if (!modules || modules.length === 0) {
      res.status(400).json({ success: false, error: 'Course has no modules' });
      return;
    }

    const moduleIds = modules.map((m: any) => m.id);

    const { data: lessons, error: lessonsError } = await supabase
      .from('course_lessons')
      .select('id')
      .in('module_id', moduleIds);

    if (lessonsError) throw lessonsError;

    if (!lessons || lessons.length === 0) {
      res.status(400).json({ success: false, error: 'Course has no lessons' });
      return;
    }

    const lessonIds = lessons.map((l: any) => l.id);

    // Get completed lessons for this user
    const { data: completedLessons, error: progressError } = await supabase
      .from('user_lesson_progress')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('is_completed', true)
      .in('lesson_id', lessonIds);

    if (progressError) throw progressError;

    const completedCount = (completedLessons || []).length;
    const totalCount = lessonIds.length;

    if (completedCount < totalCount) {
      res.status(400).json({
        success: false,
        error: `Course not fully completed. Progress: ${completedCount}/${totalCount} lessons`,
      });
      return;
    }

    // Generate certificate
    let certificateNumber = generateCertificateNumber();

    // Ensure uniqueness
    let attempts = 0;
    while (attempts < 5) {
      const { data: dup } = await supabase
        .from('certificates')
        .select('id')
        .eq('certificate_number', certificateNumber)
        .maybeSingle();

      if (!dup) break;
      certificateNumber = generateCertificateNumber();
      attempts++;
    }

    const { data: certificate, error: certError } = await supabase
      .from('certificates')
      .insert({
        user_id: userId,
        course_id: Number(course_id),
        certificate_number: certificateNumber,
        issued_at: new Date().toISOString(),
        pdf_url: null,
      })
      .select()
      .single();

    if (certError) throw certError;

    res.status(201).json({
      success: true,
      data: certificate,
      message: 'Certificate generated successfully',
    });
  } catch (error: any) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get user's certificates
 */
export const getMyCertificates = async (req: CabinetAuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.clientUser?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('certificates')
      .select('*, courses(id, title, slug, thumbnail_url)')
      .eq('user_id', userId)
      .order('issued_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Public endpoint to verify certificate by number
 */
export const verifyCertificate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { number } = req.params;
    const supabase = getSupabaseClient();

    const { data: certificate, error } = await supabase
      .from('certificates')
      .select('*, courses(id, title, slug), client_profiles(id, full_name)')
      .eq('certificate_number', number)
      .maybeSingle();

    if (error) throw error;

    if (!certificate) {
      res.status(404).json({ success: false, error: 'Certificate not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        certificate_number: certificate.certificate_number,
        issued_at: certificate.issued_at,
        course: certificate.courses,
        holder: certificate.client_profiles,
      },
    });
  } catch (error: any) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Admin: get all certificates for a course
 */
export const getCourseCertificates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('certificates')
      .select('*, client_profiles(id, full_name, email)')
      .eq('course_id', Number(courseId))
      .order('issued_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching course certificates:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
