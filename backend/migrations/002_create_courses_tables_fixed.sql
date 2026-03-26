-- Удаляем старые таблицы если они есть (осторожно!)
DROP TABLE IF EXISTS user_lesson_progress CASCADE;
DROP TABLE IF EXISTS user_course_progress CASCADE;
DROP TABLE IF EXISTS course_materials CASCADE;
DROP TABLE IF EXISTS course_lessons CASCADE;
DROP TABLE IF EXISTS course_modules CASCADE;
DROP TABLE IF EXISTS courses CASCADE;

-- Таблица курсов
CREATE TABLE courses (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  thumbnail_url TEXT,
  duration VARCHAR(50),
  level VARCHAR(50) DEFAULT 'beginner',
  status VARCHAR(50) DEFAULT 'draft',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица модулей курса
CREATE TABLE course_modules (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица уроков модуля
CREATE TABLE course_lessons (
  id BIGSERIAL PRIMARY KEY,
  module_id BIGINT REFERENCES course_modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  video_url TEXT,
  video_provider VARCHAR(50) DEFAULT 'youtube',
  duration VARCHAR(50),
  order_index INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица материалов курса
CREATE TABLE course_materials (
  id BIGSERIAL PRIMARY KEY,
  lesson_id BIGINT REFERENCES course_lessons(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type VARCHAR(50),
  external_url TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица прогресса пользователей
CREATE TABLE user_course_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  last_accessed_at TIMESTAMP DEFAULT NOW(),
  progress_percentage INTEGER DEFAULT 0,
  UNIQUE(user_id, course_id)
);

-- Таблица прогресса по урокам
CREATE TABLE user_lesson_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id BIGINT REFERENCES course_lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  last_watched_position INTEGER DEFAULT 0,
  UNIQUE(user_id, lesson_id)
);

-- Индексы для оптимизации
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_course_modules_course ON course_modules(course_id);
CREATE INDEX idx_course_lessons_module ON course_lessons(module_id);
CREATE INDEX idx_course_materials_lesson ON course_materials(lesson_id);
CREATE INDEX idx_user_progress_user ON user_course_progress(user_id);
CREATE INDEX idx_user_progress_course ON user_course_progress(course_id);
CREATE INDEX idx_lesson_progress_user ON user_lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson ON user_lesson_progress(lesson_id);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON course_modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON course_lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON course_materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Включить Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Политики доступа для courses
CREATE POLICY "Курсы доступны всем для чтения" ON courses
  FOR SELECT USING (is_published = true);

CREATE POLICY "Только админы могут управлять курсами" ON courses
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Политики для модулей, уроков и материалов
CREATE POLICY "Модули доступны всем для чтения" ON course_modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses WHERE courses.id = course_modules.course_id AND courses.is_published = true
    )
  );

CREATE POLICY "Только админы могут управлять модулями" ON course_modules
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Уроки доступны всем для чтения" ON course_lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM course_modules
      JOIN courses ON courses.id = course_modules.course_id
      WHERE course_modules.id = course_lessons.module_id AND courses.is_published = true
    )
  );

CREATE POLICY "Только админы могут управлять уроками" ON course_lessons
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Материалы доступны всем для чтения" ON course_materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM course_lessons
      JOIN course_modules ON course_modules.id = course_lessons.module_id
      JOIN courses ON courses.id = course_modules.course_id
      WHERE course_lessons.id = course_materials.lesson_id AND courses.is_published = true
    )
  );

CREATE POLICY "Только админы могут управлять материалами" ON course_materials
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Политики для прогресса
CREATE POLICY "Пользователи могут видеть свой прогресс" ON user_course_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут обновлять свой прогресс" ON user_course_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Пользователи могут обновлять свой прогресс" ON user_course_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут видеть прогресс по урокам" ON user_lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут обновлять прогресс по урокам" ON user_lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Пользователи могут обновлять прогресс по урокам" ON user_lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);
