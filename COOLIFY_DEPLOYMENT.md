# Развёртывание AURVA на Coolify

Данная инструкция описывает процесс развёртывания проекта AURVA (Backend + Admin Panel) на платформе Coolify с использованием Supabase.

## Предварительные требования

- Доступ к панели управления Coolify: https://coolify.aurva.kg/
- Git репозиторий проекта: https://github.com/emirkhayam/aurva.git
- Настроенный Supabase инстанс (уже настроен с предоставленными credentials)

## Структура проекта

```
aurva/
├── backend/              # Backend API (Node.js/Express/TypeScript)
│   ├── Dockerfile
│   └── src/
├── admin-panel/          # Admin Panel (React/Vite/TypeScript)
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
└── docker-compose.yml    # Конфигурация для Coolify
```

## Шаг 1: Подготовка репозитория

1. **Убедитесь, что все изменения закоммичены в Git:**

```bash
git add .
git commit -m "Add Supabase integration and Coolify deployment configuration"
git push origin master
```

2. **Проверьте, что файлы присутствуют:**
   - `docker-compose.yml` в корне проекта
   - `backend/Dockerfile`
   - `admin-panel/Dockerfile`
   - `admin-panel/nginx.conf`
   - `.env.production` (используется как шаблон)

## Шаг 2: Создание приложения в Coolify

1. Откройте Coolify панель: https://coolify.aurva.kg/
2. Войдите в систему
3. Нажмите "New Resource" → "Application"
4. Выберите "Docker Compose"

## Шаг 3: Настройка приложения

### Основные настройки:

1. **Name:** `aurva-app`
2. **Git Repository:** `https://github.com/emirkhayam/aurva.git`
3. **Branch:** `master`
4. **Docker Compose Location:** `/docker-compose.yml`

### Переменные окружения:

В разделе "Environment Variables" добавьте следующие переменные из файла `.env.production`:

#### Backend переменные:

```env
JWT_SECRET=SX6aA69J35iHTBfOXkZT70AN4YnsPq4y

# Supabase
SUPABASE_URL=https://supabasekong-a048ksg80wksowg4s0skogcw.aurva.kg
SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MjcxNDE2MCwiZXhwIjo0OTI4Mzg3NzYwLCJyb2xlIjoiYW5vbiJ9.c0IVF8EW1Fbu_BpAVhzNIOz2ILVSNH4GwXTob9sUdz8
SUPABASE_SERVICE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MjcxNDE2MCwiZXhwIjo0OTI4Mzg3NzYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.q8zI5BCSecVpWENTlewQB3wV4zola45Pt2U5j9bmvyw

# Postgres
POSTGRES_HOST=supabase-db
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=q5rat5j7VaOE0qE8Qx9ZXklFzSeXYVY6

# Auth
AUTH_JWT_SECRET=SX6aA69J35iHTBfOXkZT70AN4YnsPq4y
GOTRUE_SITE_URL=https://supabasekong-a048ksg80wksowg4s0skogcw.aurva.kg

# Storage
MINIO_ROOT_USER=mQtzVOY7iA1RpPmA
MINIO_ROOT_PASSWORD=Hqg7oy2tShDfWksk6ffUdUNOwfMPsMjL
AWS_ACCESS_KEY_ID=mQtzVOY7iA1RpPmA
AWS_SECRET_ACCESS_KEY=Hqg7oy2tShDfWksk6ffUdUNOwfMPsMjL

# Email (настройте свои SMTP данные)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=aurva.kg@gmail.com
EMAIL_PASSWORD=your_smtp_password
EMAIL_FROM=aurva.kg@gmail.com

# Admin
ADMIN_EMAIL=admin@aurva.kg
ADMIN_PASSWORD=your_secure_admin_password

# CORS
CORS_ORIGIN=*

# Backend URL (замените на ваш фактический URL)
BACKEND_URL=https://api.aurva.kg
```

## Шаг 4: Настройка доменов

### Backend (API):
1. В настройках сервиса `backend` добавьте домен
2. Например: `api.aurva.kg`
3. Coolify автоматически настроит SSL сертификат

### Admin Panel:
1. В настройках сервиса `admin-panel` добавьте домен
2. Например: `admin.aurva.kg` или главный домен `aurva.kg`
3. Coolify автоматически настроит SSL сертификат

### Важно:
После добавления доменов, обновите переменную `BACKEND_URL` в настройках, чтобы она указывала на фактический URL backend API.

## Шаг 5: Развёртывание

1. Нажмите "Deploy" в Coolify
2. Coolify выполнит:
   - Clone репозитория
   - Build Docker образов для backend и admin-panel
   - Запуск контейнеров
   - Настройку reverse proxy и SSL

3. Мониторинг развёртывания:
   - Следите за логами в реальном времени
   - Проверьте статус health checks

## Шаг 6: Проверка работоспособности

### Backend API:
```bash
curl https://api.aurva.kg/health
# Должен вернуть: {"status": "ok"}
```

### Admin Panel:
Откройте в браузере: `https://admin.aurva.kg`

## Шаг 7: Настройка CI/CD (Автоматическое развёртывание)

Coolify может автоматически развёртывать изменения при push в master:

1. В настройках приложения включите "Auto Deploy"
2. Coolify настроит webhook для GitHub
3. При каждом push в master будет происходить автоматическое развёртывание

## Управление приложением

### Просмотр логов:
```bash
# Backend logs
docker logs aurva-backend -f

# Admin Panel logs
docker logs aurva-admin-panel -f
```

### Перезапуск сервисов:
Используйте панель Coolify для перезапуска отдельных сервисов или всего приложения.

### Обновление переменных окружения:
1. Измените переменные в панели Coolify
2. Нажмите "Redeploy" для применения изменений

## Резервное копирование

### Volumes:
Docker volumes автоматически создаются:
- `backend-uploads` - загруженные файлы
- `backend-data` - данные приложения

Настройте регулярное резервное копирование этих volumes через панель Coolify.

## Мониторинг и Health Checks

Оба сервиса имеют health checks:

**Backend:**
- URL: `/health`
- Interval: 30s
- Timeout: 10s
- Retries: 3

**Admin Panel:**
- URL: `/health`
- Через nginx

## Устранение неполадок

### Проблема: Backend не может подключиться к Supabase

**Решение:**
1. Проверьте переменные окружения `SUPABASE_URL` и `SUPABASE_ANON_KEY`
2. Убедитесь, что Supabase инстанс доступен
3. Проверьте логи backend: `docker logs aurva-backend`

### Проблема: Admin Panel показывает ошибку подключения к API

**Решение:**
1. Проверьте переменную `VITE_API_URL` (должна указывать на backend URL)
2. Убедитесь, что backend работает и доступен
3. Проверьте CORS настройки

### Проблема: SSL сертификат не работает

**Решение:**
1. Убедитесь, что DNS записи правильно настроены
2. Подождите несколько минут для генерации сертификата
3. Проверьте логи Coolify

## Безопасность

### Рекомендации:

1. **Измените пароли по умолчанию:**
   - `ADMIN_PASSWORD`
   - `JWT_SECRET` (используйте длинную случайную строку)

2. **Настройте CORS правильно:**
   - Вместо `CORS_ORIGIN=*` укажите конкретные домены
   - Например: `CORS_ORIGIN=https://aurva.kg,https://admin.aurva.kg`

3. **Настройте SMTP:**
   - Используйте реальные SMTP credentials для отправки email

4. **Регулярно обновляйте зависимости:**
```bash
cd backend && npm audit fix
cd ../admin-panel && npm audit fix
```

## Масштабирование

Для увеличения производительности:

1. **Backend:**
   - Увеличьте количество реплик в docker-compose.yml
   - Настройте load balancer в Coolify

2. **Database:**
   - Используйте Supabase Postgres для production
   - Настройте connection pooling

3. **Storage:**
   - Используйте Supabase Storage для файлов
   - Настройте CDN для статических ресурсов

## Поддержка

При возникновении проблем:
1. Проверьте логи сервисов
2. Изучите документацию Coolify: https://coolify.io/docs
3. Проверьте статус Supabase: https://status.supabase.com/

## Полезные команды

```bash
# Локальное тестирование Docker Compose
docker-compose up -d

# Проверка статуса сервисов
docker-compose ps

# Просмотр логов
docker-compose logs -f

# Остановка сервисов
docker-compose down

# Остановка с удалением volumes
docker-compose down -v
```

## Changelog

### 2026-03-05
- Начальная настройка Coolify deployment
- Интеграция Supabase
- Создание Docker Compose конфигурации
- Настройка multi-container приложения (Backend + Admin Panel)
