import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function seedFirstCourse() {
  try {
    console.log('🌱 Начинаю добавление первого курса...\n');

    // 1. Создаем курс
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert([
        {
          title: 'Информационное взаимодействие с ГСФР (Предоставление информации в ГСФР)',
          slug: 'inform-vzaimod-gsfr',
          description: 'Краткое руководство по техническому взаимодействию с ГСФР. Обзор Защищённого электронного канала связи (ЗЭКС) и Автоматизированного рабочего места (АРМ).',
          short_description: 'Обзор ЗЭКС и АРМ для взаимодействия с ГСФР',
          thumbnail_url: '',
          duration: '~30 минут',
          level: 'beginner',
          status: 'published',
          is_published: true,
          published_at: new Date().toISOString(),
          order_index: 1
        }
      ])
      .select()
      .single();

    if (courseError) throw courseError;
    console.log('✅ Курс создан:', course.title);

    // 2. Создаем модуль "Вводная часть (теория)"
    const { data: module1, error: module1Error } = await supabase
      .from('course_modules')
      .insert([
        {
          course_id: course.id,
          title: '1. Вводная часть (теория)',
          description: 'Теоретическая часть курса с основными понятиями и принципами работы с ГСФР',
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
        title: '1.1. Основы информационно-технического взаимодействия с ГСФР: принципы, используемые технологии, общая схема обмена данными',
        content: 'Введение в основы информационно-технического взаимодействия с Государственной службой финансовой разведки (ГСФР).',
        video_url: 'https://www.youtube.com/watch?v=iwPtviTN0R4',
        video_provider: 'youtube',
        duration: '~20 минут',
        order_index: 1,
        is_free: true
      },
      {
        module_id: module1.id,
        title: '1.2. Понятие защищённого электронного канала связи (ЗЭКС): назначение, состав программных средств, принцип работы',
        content: 'Подробное рассмотрение защищённого электронного канала связи (ЗЭКС) и его компонентов.',
        video_url: '',
        video_provider: 'youtube',
        duration: '',
        order_index: 2,
        is_free: true
      },
      {
        module_id: module1.id,
        title: '1.3. Автоматизированное рабочее место (АРМ): что это такое и для чего используется. Основные функции АРМ в системе взаимодействия с ГСФР',
        content: 'Обзор автоматизированного рабочего места (АРМ) и его роли в системе взаимодействия с ГСФР.',
        video_url: '',
        video_provider: 'youtube',
        duration: '',
        order_index: 3,
        is_free: true
      },
      {
        module_id: module1.id,
        title: '1.4. Перечень документов, необходимых для подключения к информационной системе ГСФР',
        content: 'Полный список документов и материалов, необходимых для подключения к информационной системе ГСФР.',
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

      // Добавляем материалы к урокам
      if (lesson.order_index === 1) {
        // Материалы к первому уроку
        const materials = [
          {
            lesson_id: lesson.id,
            title: 'Организация ЗЭКС',
            description: 'Необходимые документы и материалы для ЗЭКС находятся в данном блоке',
            external_url: 'https://fiu.gov.kg/organization/2',
            file_type: 'link',
            order_index: 1
          },
          {
            lesson_id: lesson.id,
            title: 'Регламент по ЗЭКСу',
            description: 'Регламент по защищённому электронному каналу связи',
            external_url: '#',
            file_type: 'document',
            order_index: 2
          },
          {
            lesson_id: lesson.id,
            title: 'Соглашение по ЗЭКС',
            description: 'Соглашение по защищённому электронному каналу связи',
            external_url: '#',
            file_type: 'document',
            order_index: 3
          },
          {
            lesson_id: lesson.id,
            title: 'Перечень информаций, сообщений и документов',
            description: 'Перечень информаций, сообщений и документов, подлежащих передаче по ЗЭКС',
            external_url: '#',
            file_type: 'document',
            order_index: 4
          },
          {
            lesson_id: lesson.id,
            title: 'Форма заявки о предоставлении доступа к ЗЭКС',
            description: 'Форма заявки о предоставлении доступа к защищённому электронному каналу связи',
            external_url: '#',
            file_type: 'form',
            order_index: 5
          },
          {
            lesson_id: lesson.id,
            title: 'Форма регистрационной карточки абонента ЗЭКС',
            description: 'Форма регистрационной карточки абонента защищённого электронного канала связи',
            external_url: '#',
            file_type: 'form',
            order_index: 6
          },
          {
            lesson_id: lesson.id,
            title: 'Скачать CheckPoint VPN',
            description: 'Программное обеспечение CheckPoint VPN для подключения к ЗЭКС',
            external_url: '#',
            file_type: 'software',
            order_index: 7
          },
          {
            lesson_id: lesson.id,
            title: 'Инструкция подключения к ЗЭКС ГСФР',
            description: 'Пошаговая инструкция по подключению к защищённому электронному каналу связи ГСФР',
            external_url: '#',
            file_type: 'document',
            order_index: 8
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

      if (lesson.order_index === 3) {
        // Материалы к уроку об АРМ
        const armMaterials = [
          {
            lesson_id: lesson.id,
            title: 'Программное обеспечение ARM FUS PL',
            description: 'Программное обеспечение для автоматизированного рабочего места',
            external_url: '#',
            file_type: 'software',
            order_index: 1
          },
          {
            lesson_id: lesson.id,
            title: 'Инструкция о порядке заполнения Формы 1',
            description: 'Руководство по заполнению формы отчётности',
            external_url: '#',
            file_type: 'document',
            order_index: 2
          },
          {
            lesson_id: lesson.id,
            title: 'Установка АРМ для банковского сектора',
            description: 'Инструкция по установке АРМ для организаций банковского сектора',
            external_url: '#',
            file_type: 'document',
            order_index: 3
          },
          {
            lesson_id: lesson.id,
            title: 'Установка АРМ для не банковского сектора',
            description: 'Инструкция по установке АРМ для организаций небанковского сектора',
            external_url: '#',
            file_type: 'document',
            order_index: 4
          },
          {
            lesson_id: lesson.id,
            title: 'Руководство по АРМ ФУС ПЛ',
            description: 'Руководство пользователя по работе с автоматизированным рабочим местом',
            external_url: '#',
            file_type: 'document',
            order_index: 5
          },
          {
            lesson_id: lesson.id,
            title: 'Скачать программное обеспечение - ARM FUS PL',
            description: 'Дистрибутив программного обеспечения АРМ ФУС ПЛ',
            external_url: '#',
            file_type: 'software',
            order_index: 6
          },
          {
            lesson_id: lesson.id,
            title: 'Инструкция по обновлению перечня видов и справочник кодов операций',
            description: 'Руководство по обновлению справочников в системе',
            external_url: '#',
            file_type: 'document',
            order_index: 7
          },
          {
            lesson_id: lesson.id,
            title: 'Xml файл для обновления',
            description: 'Файл обновления справочников в формате XML',
            external_url: '#',
            file_type: 'file',
            order_index: 8
          }
        ];

        for (const materialData of armMaterials) {
          const { error: materialError } = await supabase
            .from('course_materials')
            .insert([materialData]);

          if (materialError) throw materialError;
        }
        console.log('   ✅ Материалы АРМ к уроку добавлены');
      }

      if (lesson.order_index === 4) {
        // Материалы к уроку о документации
        const docMaterials = [
          {
            lesson_id: lesson.id,
            title: 'Необходимая документация для постановки на учет ГСФР',
            description: 'Перечень документов для регистрации в системе ГСФР',
            external_url: '#',
            file_type: 'document',
            order_index: 1
          },
          {
            lesson_id: lesson.id,
            title: 'Формы и бланки документов',
            description: 'Бланки документов для заполнения и подачи в ГСФР',
            external_url: 'https://fiu.gov.kg/organization/5',
            file_type: 'link',
            order_index: 2
          },
          {
            lesson_id: lesson.id,
            title: 'Закрытая часть сайта - доступ',
            description: 'Инструкция по получению доступа к закрытой части сайта ГСФР',
            external_url: '#',
            file_type: 'document',
            order_index: 3
          }
        ];

        for (const materialData of docMaterials) {
          const { error: materialError } = await supabase
            .from('course_materials')
            .insert([materialData]);

          if (materialError) throw materialError;
        }
        console.log('   ✅ Материалы документации к уроку добавлены');
      }
    }

    console.log('\n🎉 Первый курс успешно добавлен в базу данных!');
    console.log(`📌 Курс доступен по адресу: /api/courses/${course.slug}`);
  } catch (error) {
    console.error('❌ Ошибка при добавлении курса:', error);
    process.exit(1);
  }
}

seedFirstCourse();
