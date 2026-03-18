# Инструкция по настройке Coolify для развертывания AURVA

Это подробная инструкция для правильной настройки многоконтейнерного развертывания проекта AURVA в Coolify.

## Текущая проблема

Сейчас приложение настроено как "Application" (Nixpacks) и развертывается как одиночный статический контейнер. Нам нужно изменить его на "Docker Compose" для запуска двух сервисов:
- **Backend** (Node.js/Express API)
- **Admin Panel** (React/Vite Frontend)

## Вариант 1: Изменить существующее приложение (РЕКОМЕНДУЕТСЯ)

### Шаг 1: Откройте настройки приложения
Перейдите в: https://coolify.aurva.kg/project/awc4s8scwo8swwgw84wc8s0w/environment/o40ccc04kog0k0wsooocks84/application/akc00owgk8oocwgwsoo8wk4w

### Шаг 2: Измените тип билда
1. Нажмите на вкладку **"General"**
2. Найдите секцию **"Build Pack"** или **"Build Configuration"**
3. Измените тип с **"Nixpacks"** на **"Docker Compose"**
4. В поле **"Docker Compose Location"** укажите: `/docker-compose.yml`

### Шаг 3: Настройте переменные окружения
Перейдите на вкладку **"Environment Variables"** и добавьте следующие переменные:

```env
# JWT Configuration
JWT_SECRET=SX6aA69J35iHTBfOXkZT70AN4YnsPq4y

# Supabase Postgres Configuration
POSTGRES_HOST=supabase-db-a048ksg80wksowg4s0skogcw
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=q5rat5j7VaOE0qE8Qx9ZXklFzSeXYVY6
POSTGRES_SSL=false
NODE_ENV=production

# Supabase Configuration
SUPABASE_URL=https://supabasekong-a048ksg80wksowg4s0skogcw.aurva.kg
SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MjcxNDE2MCwiZXhwIjo0OTI4Mzg3NzYwLCJyb2xlIjoiYW5vbiJ9.c0IVF8EW1Fbu_BpAVhzNIOz2ILVSNH4GwXTob9sUdz8
SUPABASE_SERVICE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MjcxNDE2MCwiZXhwIjo0OTI4Mzg3NzYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.q8zI5BCSecVpWENTlewQB3wV4zola45Pt2U5j9bmvyw

# Supabase Auth Configuration
AUTH_JWT_SECRET=SX6aA69J35iHTBfOXkZT70AN4YnsPq4y
GOTRUE_SITE_URL=https://supabasekong-a048ksg80wksowg4s0skogcw.aurva.kg

# Supabase Storage (MinIO) Configuration
AWS_ACCESS_KEY_ID=mQtzVOY7iA1RpPmA
AWS_SECRET_ACCESS_KEY=Hqg7oy2tShDfWksk6ffUdUNOwfMPsMjL
MINIO_ROOT_USER=mQtzVOY7iA1RpPmA
MINIO_ROOT_PASSWORD=Hqg7oy2tShDfWksk6ffUdUNOwfMPsMjL

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=aurva.kg@gmail.com
EMAIL_PASSWORD=your_email_password_here
EMAIL_FROM=aurva.kg@gmail.com

# Admin Configuration
ADMIN_EMAIL=admin@aurva.kg
ADMIN_PASSWORD=admin123

# CORS Configuration
CORS_ORIGIN=*

# Backend URL (internal Docker network)
BACKEND_URL=http://backend:3000
```

### Шаг 4: Настройте домены
В разделе **"Domains"** убедитесь, что:
- Для admin-panel настроен домен: **aurva.kg**
- Backend остается внутренним (без внешнего домена)

### Шаг 5: Сохраните и разверните
1. Нажмите **"Save"** для сохранения настроек
2. Нажмите **"Redeploy"** для перезапуска с новой конфигурацией

---

## Вариант 2: Создать новое приложение Docker Compose

Если изменение существующего приложения не работает, создайте новое:

### Шаг 1: Создайте новый ресурс
1. В Coolify перейдите в проект AURVA
2. Нажмите **"+ New Resource"**
3. Выберите **"Docker Compose"**

### Шаг 2: Настройте источник
1. **Source**: Git Repository
2. **Repository**: `https://github.com/emirkhayam/aurva.git`
3. **Branch**: `master`
4. **Docker Compose Location**: `/docker-compose.yml`

### Шаг 3: Добавьте переменные окружения
Добавьте те же переменные окружения, что указаны в Варианте 1, Шаг 3.

### Шаг 4: Настройте сеть
В разделе **"Networks"** убедитесь, что:
- Добавлена сеть **coolify** (для Traefik proxy)
- Добавлена сеть **a048ksg80wksowg4s0skogcw** (для Supabase)

### Шаг 5: Настройте домен
1. Для сервиса **admin-panel** установите домен: **aurva.kg**
2. Для сервиса **backend** - оставьте без внешнего домена

### Шаг 6: Deploy
Нажмите **"Deploy"** для запуска развертывания.

---

## Проверка развертывания

После успешного развертывания должны быть запущены два контейнера:

### Проверка через SSH:
```bash
ssh aurva "sudo docker ps --format 'table {{.Names}}\t{{.Image}}' | grep backend"
ssh aurva "sudo docker ps --format 'table {{.Names}}\t{{.Image}}' | grep admin"
```

### Проверка логов:
```bash
# Backend logs
ssh aurva "sudo docker logs <backend-container-id> --tail 50"

# Admin Panel logs
ssh aurva "sudo docker logs <admin-panel-container-id> --tail 50"
```

### Проверка сайта:
```bash
curl -I https://aurva.kg
```

Должен вернуть HTTP 200 и показать админ-панель React приложения.

---

## Ожидаемая архитектура после развертывания

```
┌─────────────────────────────────────────────────────┐
│                   Internet                           │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
           ┌─────────────────────┐
           │  Traefik Proxy      │
           │  (coolify-proxy)    │
           │  aurva.kg → :80     │
           └─────────┬───────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│  Admin Panel    │    │   Backend API    │
│  (React/Vite)   │◄───┤  (Node.js/Express)│
│  Port 80        │    │  Port 3000       │
└─────────────────┘    └────────┬─────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  Supabase PostgreSQL   │
                    │  supabase-db-...       │
                    │  Port 5432             │
                    └────────────────────────┘
```

---

## Устранение неполадок

### Проблема 1: Backend не может подключиться к Supabase
**Решение:**
- Проверьте, что контейнеры находятся в одной сети с Supabase
- Убедитесь, что `POSTGRES_HOST=supabase-db-a048ksg80wksowg4s0skogcw`
- Проверьте логи backend: `docker logs <backend-container-id>`

### Проблема 2: Admin Panel показывает ошибку подключения к API
**Решение:**
- Проверьте переменную `BACKEND_URL=http://backend:3000`
- Убедитесь, что оба контейнера находятся в одной внутренней сети
- Проверьте CORS настройки

### Проблема 3: Coolify не находит docker-compose.yml
**Решение:**
- Убедитесь, что путь указан как `/docker-compose.yml` (с ведущим слэшем)
- Проверьте, что файл есть в корне репозитория на GitHub

### Проблема 4: Контейнеры не запускаются
**Решение:**
- Проверьте логи сборки в Coolify UI
- Убедитесь, что все переменные окружения установлены
- Проверьте, что Dockerfiles существуют в `backend/` и `admin-panel/`

---

## Автоматическое развертывание

После настройки, Coolify автоматически будет:
1. Отслеживать изменения в ветке `master` на GitHub
2. Автоматически пересобирать контейнеры при push
3. Перезапускать сервисы с новым кодом
4. Сохранять volumes (uploads, data) между deployments

---

## Полезные команды

### Просмотр запущенных контейнеров:
```bash
ssh aurva "sudo docker ps"
```

### Просмотр логов:
```bash
ssh aurva "sudo docker logs <container-name> -f"
```

### Перезапуск контейнера:
```bash
ssh aurva "sudo docker restart <container-name>"
```

### Проверка сетей:
```bash
ssh aurva "sudo docker network ls"
ssh aurva "sudo docker network inspect coolify"
ssh aurva "sudo docker network inspect a048ksg80wksowg4s0skogcw"
```

---

## Контакты для поддержки

При возникновении проблем:
1. Проверьте логи в Coolify UI
2. Проверьте логи контейнеров через SSH
3. Обратитесь к документации Coolify: https://coolify.io/docs
4. Проверьте README.md и INTEGRATION_GUIDE.md в проекте

---

**Дата создания:** 2026-03-05
**Версия:** 1.0
**Автор:** Claude Code Assistant
