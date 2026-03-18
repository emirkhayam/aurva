# 📚 Инструкция по Настройке Supabase для AURVA

## 🎯 Обзор

Эта инструкция поможет вам полностью настроить Supabase для проекта AURVA:
- ✅ База данных (PostgreSQL)
- ✅ Аутентификация (Supabase Auth)
- ✅ Хранилище файлов (Supabase Storage)
- ✅ Row Level Security (RLS)

---

## Шаг 1: Применение SQL Миграций

### 1.1 Откройте SQL Editor в Supabase

1. Перейдите на https://supabase.com/dashboard
2. Выберите ваш проект: **vtkyejkhezzktzguojbr**
3. В левом меню нажмите на **SQL Editor**
4. Нажмите **New Query**

### 1.2 Запустите миграцию

1. Откройте файл `supabase-migration.sql` из корня проекта
2. Скопируйте **весь код** из файла
3. Вставьте в SQL Editor
4. Нажмите **Run** (или Ctrl+Enter)

**Ожидаемый результат:**
```
✅ AURVA Database Migration Completed Successfully!
📊 Created 8 tables with indexes and triggers
🔒 Enabled Row Level Security on all tables
👥 Next step: Create admin user via Supabase Auth
```

### 1.3 Проверьте таблицы

Перейдите в **Table Editor** и убедитесь, что созданы следующие таблицы:
- ✅ `user_profiles`
- ✅ `news`
- ✅ `news_images`
- ✅ `members`
- ✅ `contacts`
- ✅ `team_members`
- ✅ `site_settings`
- ✅ `partners`

---

## Шаг 2: Настройка Supabase Storage

### 2.1 Создание Storage Bucket

1. В левом меню нажмите **Storage**
2. Нажмите **Create a new bucket**
3. Заполните форму:
   - **Name:** `uploads`
   - **Public bucket:** ✅ **Включите** (чекбокс должен быть отмечен)
   - **File size limit:** 50 MB
   - **Allowed MIME types:** Оставьте пустым (разрешить все)
4. Нажмите **Create bucket**

### 2.2 Создание папок в bucket

После создания bucket, создайте следующие папки:

1. Откройте bucket `uploads`
2. Нажмите **Upload** → **Create folder**
3. Создайте папки:
   - `news/` - для изображений новостей
   - `members/` - для логотипов членов ассоциации
   - `partners/` - для логотипов партнеров
   - `team/` - для фотографий команды

### 2.3 Настройка Storage Policies

1. Нажмите на bucket `uploads`
2. Перейдите на вкладку **Policies**
3. Нажмите **New Policy**

**Policy 1: Public Read Access**
```sql
-- Название: Public can read all files
-- Operation: SELECT
-- Policy definition:
(bucket_id = 'uploads'::text)
```

**Policy 2: Authenticated Users Can Upload**
```sql
-- Название: Authenticated users can upload files
-- Operation: INSERT
-- Policy definition:
(bucket_id = 'uploads'::text AND auth.role() = 'authenticated'::text)
```

**Policy 3: Authenticated Users Can Update**
```sql
-- Название: Authenticated users can update files
-- Operation: UPDATE
-- Policy definition:
(bucket_id = 'uploads'::text AND auth.role() = 'authenticated'::text)
```

**Policy 4: Authenticated Users Can Delete**
```sql
-- Название: Authenticated users can delete files
-- Operation: DELETE
-- Policy definition:
(bucket_id = 'uploads'::text AND auth.role() = 'authenticated'::text)
```

---

## Шаг 3: Настройка Supabase Auth

### 3.1 Включение Email Provider

1. В левом меню нажмите **Authentication** → **Providers**
2. Найдите **Email** provider
3. Убедитесь, что он **включен** (Enable sign ups: ON)
4. Настройки:
   - **Enable email confirmations:** OFF (для упрощения в dev)
   - **Secure email change:** ON
   - **Double confirm email changes:** ON

### 3.2 Настройка Email Templates (Опционально)

1. Перейдите в **Authentication** → **Email Templates**
2. Отредактируйте шаблоны на русский язык:

**Confirmation Email:**
```
Добро пожаловать в AURVA!

Подтвердите ваш email, перейдя по ссылке:
{{ .ConfirmationURL }}
```

**Invite Email:**
```
Вы приглашены в AURVA!

Перейдите по ссылке для установки пароля:
{{ .ConfirmationURL }}
```

**Magic Link:**
```
Войдите в AURVA

Перейдите по ссылке для входа:
{{ .ConfirmationURL }}
```

**Password Reset:**
```
Сброс пароля AURVA

Перейдите по ссылке для сброса пароля:
{{ .ConfirmationURL }}
```

### 3.3 Создание первого Admin пользователя

Есть **два способа** создать admin пользователя:

#### Способ 1: Через Supabase Dashboard (Рекомендуется)

1. Перейдите в **Authentication** → **Users**
2. Нажмите **Add user** → **Create new user**
3. Заполните форму:
   - **Email:** `admin@aurva.kg`
   - **Password:** (ваш безопасный пароль)
   - **Auto Confirm User:** ✅ Включите
4. Нажмите **Create user**
5. **Скопируйте UUID пользователя** (например: `123e4567-e89b-12d3-a456-426614174000`)

6. Теперь создайте профиль в `user_profiles`:
   - Перейдите в **SQL Editor**
   - Выполните запрос:

```sql
-- Замените USER_UUID на скопированный UUID
INSERT INTO public.user_profiles (id, email, name, role, is_active)
VALUES (
  'USER_UUID'::uuid,  -- Вставьте UUID здесь
  'admin@aurva.kg',
  'Администратор',
  'admin',
  true
);
```

#### Способ 2: Через SQL (Альтернативный)

```sql
-- ВНИМАНИЕ: Этот способ не создает пользователя в auth.users
-- Используйте только для тестирования

-- 1. Сначала создайте пользователя через Dashboard (шаги выше)
-- 2. Затем добавьте профиль этим запросом

INSERT INTO public.user_profiles (id, email, name, role, is_active)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@aurva.kg'),
  'admin@aurva.kg',
  'Администратор',
  'admin',
  true
);
```

### 3.4 Проверка создания пользователя

1. Перейдите в **Table Editor** → `user_profiles`
2. Убедитесь, что запись создана с role = 'admin'

---

## Шаг 4: Настройка JWT Settings (Опционально)

### 4.1 Настройка JWT Expiry

1. Перейдите в **Settings** → **Auth**
2. Настройте время жизни токенов:
   - **JWT expiry limit:** `604800` (7 дней)
   - **Refresh token reuse interval:** `10` (секунд)

### 4.2 Настройка Site URL

1. В **Settings** → **Auth** найдите **Site URL**
2. Укажите:
   - **Development:** `http://localhost:3000`
   - **Production:** `https://aurva.kg`

3. Добавьте **Redirect URLs:**
   - `http://localhost:3000/admin/**`
   - `https://aurva.kg/admin/**`

---

## Шаг 5: Проверка настроек

### 5.1 Проверьте подключение к базе данных

Выполните тестовый запрос в **SQL Editor**:

```sql
-- Проверка всех таблиц
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Должны увидеть 8 таблиц.**

### 5.2 Проверьте RLS Policies

```sql
-- Проверка политик безопасности
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Должны увидеть около 15+ политик.**

### 5.3 Проверьте Storage

1. Перейдите в **Storage** → `uploads`
2. Загрузите тестовое изображение в папку `news/`
3. Получите публичный URL
4. Откройте URL в браузере - изображение должно отобразиться

---

## Шаг 6: Получение финальных Credentials

### 6.1 API Keys

Перейдите в **Settings** → **API**

Скопируйте:
```
Project URL: https://vtkyejkhezzktzguojbr.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 6.2 Database Connection

Перейдите в **Settings** → **Database**

Скопируйте:
```
Host: db.vtkyejkhezzktzguojbr.supabase.co
Database name: postgres
Port: 5432
User: postgres
Password: [ваш пароль при создании проекта]
```

---

## 🎉 Готово!

Теперь Supabase полностью настроен для проекта AURVA.

### Следующие шаги:

1. ✅ Обновите `.env` файл с новыми credentials
2. ✅ Запустите миграцию кода (замена Sequelize на Supabase Client)
3. ✅ Протестируйте подключение

---

## 🔧 Troubleshooting

### Проблема: "RLS policy violation" при запросах

**Решение:** Убедитесь, что:
1. RLS policies применены правильно
2. Пользователь аутентифицирован (для admin операций)
3. У пользователя есть запись в `user_profiles` с role='admin'

### Проблема: Не удается загрузить файлы в Storage

**Решение:**
1. Проверьте, что bucket `uploads` создан как **public**
2. Проверьте Storage policies (должны быть 4 политики)
3. Убедитесь, что используется правильный Service Role Key для загрузки

### Проблема: "User not found" при логине

**Решение:**
1. Проверьте, что пользователь создан в **Authentication** → **Users**
2. Проверьте, что есть соответствующая запись в `user_profiles`
3. Проверьте, что `is_active = true` в профиле

---

## 📞 Поддержка

Если возникли вопросы:
- 📖 Документация Supabase: https://supabase.com/docs
- 💬 Discord Supabase: https://discord.supabase.com
- 🐛 Проблемы с миграцией: проверьте логи в SQL Editor

---

**Дата создания:** 2026-03-09
**Версия:** 1.0
**Проект:** AURVA v3.0
