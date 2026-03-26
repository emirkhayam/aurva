import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// Получить все опубликованные курсы (публичный endpoint)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('order_index', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: courses
    });
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении курсов',
      error: error.message
    });
  }
});

// Получить курс по slug с модулями и уроками
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    // Получаем курс
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (courseError) throw courseError;
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Курс не найден'
      });
    }

    // Получаем модули курса
    const { data: modules, error: modulesError } = await supabase
      .from('course_modules')
      .select('*')
      .eq('course_id', course.id)
      .order('order_index', { ascending: true });

    if (modulesError) throw modulesError;

    // Получаем уроки для каждого модуля
    const modulesWithLessons = await Promise.all(
      (modules || []).map(async (module) => {
        const { data: lessons, error: lessonsError } = await supabase
          .from('course_lessons')
          .select('*')
          .eq('module_id', module.id)
          .order('order_index', { ascending: true });

        if (lessonsError) throw lessonsError;

        // Получаем материалы для каждого урока
        const lessonsWithMaterials = await Promise.all(
          (lessons || []).map(async (lesson) => {
            const { data: materials, error: materialsError } = await supabase
              .from('course_materials')
              .select('*')
              .eq('lesson_id', lesson.id)
              .order('order_index', { ascending: true });

            if (materialsError) throw materialsError;

            return {
              ...lesson,
              materials: materials || []
            };
          })
        );

        return {
          ...module,
          lessons: lessonsWithMaterials
        };
      })
    );

    res.json({
      success: true,
      data: {
        ...course,
        modules: modulesWithLessons
      }
    });
  } catch (error: any) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении курса',
      error: error.message
    });
  }
});

// ===== ADMIN ENDPOINTS =====

// Получить все курсы (включая неопубликованные) - только для админов
router.get('/admin/all', async (req: Request, res: Response) => {
  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: courses
    });
  } catch (error: any) {
    console.error('Error fetching all courses:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении курсов',
      error: error.message
    });
  }
});

// Создать новый курс
router.post('/', async (req: Request, res: Response) => {
  try {
    const courseData = req.body;

    const { data: course, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: course,
      message: 'Курс успешно создан'
    });
  } catch (error: any) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании курса',
      error: error.message
    });
  }
});

// Обновить курс
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const courseData = req.body;

    const { data: course, error } = await supabase
      .from('courses')
      .update(courseData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: course,
      message: 'Курс успешно обновлен'
    });
  } catch (error: any) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении курса',
      error: error.message
    });
  }
});

// Удалить курс
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Курс успешно удален'
    });
  } catch (error: any) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении курса',
      error: error.message
    });
  }
});

// ===== MODULE ENDPOINTS =====

// Создать модуль курса
router.post('/:courseId/modules', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const moduleData = { ...req.body, course_id: courseId };

    const { data: module, error } = await supabase
      .from('course_modules')
      .insert([moduleData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: module,
      message: 'Модуль успешно создан'
    });
  } catch (error: any) {
    console.error('Error creating module:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании модуля',
      error: error.message
    });
  }
});

// Обновить модуль
router.put('/modules/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const moduleData = req.body;

    const { data: module, error } = await supabase
      .from('course_modules')
      .update(moduleData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: module,
      message: 'Модуль успешно обновлен'
    });
  } catch (error: any) {
    console.error('Error updating module:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении модуля',
      error: error.message
    });
  }
});

// Удалить модуль
router.delete('/modules/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('course_modules')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Модуль успешно удален'
    });
  } catch (error: any) {
    console.error('Error deleting module:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении модуля',
      error: error.message
    });
  }
});

// ===== LESSON ENDPOINTS =====

// Создать урок
router.post('/modules/:moduleId/lessons', async (req: Request, res: Response) => {
  try {
    const { moduleId } = req.params;
    const lessonData = { ...req.body, module_id: moduleId };

    const { data: lesson, error } = await supabase
      .from('course_lessons')
      .insert([lessonData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: lesson,
      message: 'Урок успешно создан'
    });
  } catch (error: any) {
    console.error('Error creating lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании урока',
      error: error.message
    });
  }
});

// Обновить урок
router.put('/lessons/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lessonData = req.body;

    const { data: lesson, error } = await supabase
      .from('course_lessons')
      .update(lessonData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: lesson,
      message: 'Урок успешно обновлен'
    });
  } catch (error: any) {
    console.error('Error updating lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении урока',
      error: error.message
    });
  }
});

// Удалить урок
router.delete('/lessons/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('course_lessons')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Урок успешно удален'
    });
  } catch (error: any) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении урока',
      error: error.message
    });
  }
});

// ===== MATERIAL ENDPOINTS =====

// Создать материал
router.post('/lessons/:lessonId/materials', async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const materialData = { ...req.body, lesson_id: lessonId };

    const { data: material, error } = await supabase
      .from('course_materials')
      .insert([materialData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: material,
      message: 'Материал успешно создан'
    });
  } catch (error: any) {
    console.error('Error creating material:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании материала',
      error: error.message
    });
  }
});

// Обновить материал
router.put('/materials/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const materialData = req.body;

    const { data: material, error } = await supabase
      .from('course_materials')
      .update(materialData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: material,
      message: 'Материал успешно обновлен'
    });
  } catch (error: any) {
    console.error('Error updating material:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении материала',
      error: error.message
    });
  }
});

// Удалить материал
router.delete('/materials/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('course_materials')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Материал успешно удален'
    });
  } catch (error: any) {
    console.error('Error deleting material:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении материала',
      error: error.message
    });
  }
});

export default router;
