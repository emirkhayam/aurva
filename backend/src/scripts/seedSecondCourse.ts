import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function seedSecondCourse() {
  try {
    console.log('🌱 Начинаю добавление второго курса...\n');

    // 1. Создаем курс
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert([
        {
          title: 'Установка и настройка защищённого электронного канала связи',
          slug: 'ustanovka-zeks',
          description: 'Практическое руководство по установке и настройке VPN и Outlook для работы с ЗЭКС.',
          short_description: 'Установка VPN и Outlook для работы с ЗЭКС',
          thumbnail_url: '',
          duration: '~25 минут',
          level: 'beginner',
          status: 'published',
          is_published: true,
          published_at: new Date().toISOString(),
          order_index: 2
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
          title: '2. Установка и настройка защищённого электронного канала связи',
          description: 'Практическая часть: установка и настройка VPN и Outlook для работы в составе ЗЭКС',
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
        title: '2.1. Установка и настройка VPN.',
        content: 'Пошаговая инструкция по установке и настройке VPN для подключения к защищённому электронному каналу связи.',
        video_url: 'https://www.youtube.com/watch?v=NhlK7p2in9c&t=7s',
        video_provider: 'youtube',
        duration: '~15 минут',
        order_index: 1,
        is_free: true
      },
      {
        module_id: module1.id,
        title: '2.2. Установка и настройка Outlook для работы в составе ЗЭКС.',
        content: 'Настройка почтового клиента Outlook для безопасного обмена информацией через ЗЭКС.',
        video_url: '',
        video_provider: 'youtube',
        duration: '',
        order_index: 2,
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

      // Добавляем материалы к первому уроку
      if (lesson.order_index === 1) {
        const materials = [
          {
            lesson_id: lesson.id,
            title: 'Организация ЗЭКС',
            description: 'Необходимые документы и материалы для ЗЭКС находятся в данном блоке',
            external_url: 'https://fiu.gov.kg/organization/2',
            file_type: 'link',
            order_index: 1
          }
        ];

        for (const materialData of materials) {
          const { error: materialError } = await supabase
            .from('course_materials')
            .insert([materialData]);

          if (materialError) throw materialError;
        }
        console.log('   ✅ Материалы к уроку добавлены');
      }
    }

    console.log('\n🎉 Второй курс успешно добавлен в базу данных!');
    console.log(`📌 Курс доступен по адресу: /api/courses/${course.slug}`);
  } catch (error) {
    console.error('❌ Ошибка при добавлении курса:', error);
    process.exit(1);
  }
}

seedSecondCourse();
