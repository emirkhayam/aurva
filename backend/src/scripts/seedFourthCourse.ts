import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function seedFourthCourse() {
  try {
    console.log('🌱 Начинаю добавление четвертого курса...\n');

    // 1. Создаем курс
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert([
        {
          title: 'Работа с интерфейсом и функционалом АРМ',
          slug: 'rabota-s-arm',
          description: 'Обзор интерфейса АРМ, формирование и отправка сообщений, работа с квитанциями.',
          short_description: 'Работа с интерфейсом и функционалом АРМ',
          thumbnail_url: '',
          duration: '~25 минут',
          level: 'beginner',
          status: 'published',
          is_published: true,
          published_at: new Date().toISOString(),
          order_index: 4
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
          title: '4. Работа с интерфейсом и функционалом АРМ',
          description: '',
          order_index: 1
        }
      ])
      .select()
      .single();

    if (module1Error) throw module1Error;
    console.log('✅ Модуль создан:', module1.title);

    // 3. Создаем уроки модуля
    const lessons = [
      {
        module_id: module1.id,
        title: '4.1. Обзор интерфейса АРМ: назначение основных кнопок и разделов.',
        content: '',
        video_url: 'https://www.youtube.com/watch?v=R4-3V4DXRN8',
        video_provider: 'youtube',
        duration: '',
        order_index: 1,
        is_free: true
      },
      {
        module_id: module1.id,
        title: '4.2. Формирование сообщения в АРМ: структура и правила заполнения.',
        content: '',
        video_url: '',
        video_provider: 'youtube',
        duration: '',
        order_index: 2,
        is_free: true
      },
      {
        module_id: module1.id,
        title: '4.3. Корректная отправка сформированного сообщения.',
        content: '',
        video_url: '',
        video_provider: 'youtube',
        duration: '',
        order_index: 3,
        is_free: true
      },
      {
        module_id: module1.id,
        title: '4.4. Понятие квитанции: виды, порядок получения и работа с ними.',
        content: '',
        video_url: '',
        video_provider: 'youtube',
        duration: '',
        order_index: 4,
        is_free: true
      }
    ];

    for (const lessonData of lessons) {
      const { data: lesson, error: lessonError } = await supabase
        .from('course_lessons')
        .insert([lessonData])
        .select()
        .single();

      if (lessonError) throw lessonError;
      console.log('✅ Урок создан:', lesson.title);
    }

    console.log('\n🎉 Четвертый курс успешно добавлен в базу данных!');
    console.log(`📌 Курс доступен по адресу: /api/courses/${course.slug}`);
  } catch (error) {
    console.error('❌ Ошибка при добавлении курса:', error);
    process.exit(1);
  }
}

seedFourthCourse();
