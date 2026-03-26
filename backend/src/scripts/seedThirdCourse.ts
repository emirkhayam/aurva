import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function seedThirdCourse() {
  try {
    console.log('🌱 Начинаю добавление третьего курса...\n');

    // 1. Создаем курс
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert([
        {
          title: 'Установка АРМ и его компонентов',
          slug: 'ustanovka-arm',
          description: 'Пошаговая установка программного обеспечения АРМ для работы с ГСФР.',
          short_description: 'Установка АРМ и его компонентов',
          thumbnail_url: '',
          duration: '~20 минут',
          level: 'beginner',
          status: 'published',
          is_published: true,
          published_at: new Date().toISOString(),
          order_index: 3
        }
      ])
      .select()
      .single();

    if (courseError) throw courseError;
    console.log('✅ Курс создан:', course.title);

    // 2. Создаем модуль
    const { data: module1, error: module1Error } = await supabase
      .from('course_modules')
      .insert([
        {
          course_id: course.id,
          title: '3. Установка АРМ и его компонентов',
          description: 'Пошаговая установка АРМ',
          order_index: 1
        }
      ])
      .select()
      .single();

    if (module1Error) throw module1Error;
    console.log('✅ Модуль создан:', module1.title);

    // 3. Создаем урок модуля
    const { data: lesson, error: lessonError } = await supabase
      .from('course_lessons')
      .insert([
        {
          module_id: module1.id,
          title: 'Пошаговая установка АРМ',
          content: 'Пошаговая инструкция по установке программного обеспечения АРМ и его компонентов для работы с ГСФР.',
          video_url: 'https://www.youtube.com/watch?v=VYj615pQywA',
          video_provider: 'youtube',
          duration: '~20 минут',
          order_index: 1,
          is_free: true
        }
      ])
      .select()
      .single();

    if (lessonError) throw lessonError;
    console.log('✅ Урок создан:', lesson.title);

    // Добавляем материал к уроку
    const { error: materialError } = await supabase
      .from('course_materials')
      .insert([
        {
          lesson_id: lesson.id,
          title: 'Необходимые документы и материалы для АРМ',
          description: 'Необходимые документы и материалы для АРМ находятся в данном блоке',
          external_url: 'https://fiu.gov.kg/organization/2',
          file_type: 'link',
          order_index: 1
        }
      ]);

    if (materialError) throw materialError;
    console.log('   ✅ Материалы к уроку добавлены');

    console.log('\n🎉 Третий курс успешно добавлен в базу данных!');
    console.log(`📌 Курс доступен по адресу: /api/courses/${course.slug}`);
  } catch (error) {
    console.error('❌ Ошибка при добавлении курса:', error);
    process.exit(1);
  }
}

seedThirdCourse();
