# СРОЧНО: Исправление конфигурации Coolify для AURVA

## Диагностика завершена - Найдены критические проблемы!

### Обнаруженные проблемы:

1. **Приложение настроено как Single Container вместо Docker Compose**
   - Развернут только admin-panel (nginx контейнер)
   - Backend НЕ развернут
   - Не используется наш docker-compose.yml

2. **Traefik routing полностью сломан**
   - Rule: `Host(\`\`)` - пустой хост
   - PathPrefix: `://jwks4w8sscs4c8ckkccsok04.aurva.kg` - неправильный формат
   - Результат: сайт возвращает 404

3. **Отсутствуют переменные окружения**
   - Нет переменных для Supabase
   - Нет переменных для JWT
   - Нет BACKEND_URL для admin-panel

## ЧТО НУЖНО СДЕЛАТЬ В COOLIFY UI:

### Шаг 1: Удалить текущее приложение

1. Откройте: https://coolify.aurva.kg/project/awc4s8scwo8swwgw84wc8s0w/environment/o40ccc04kog0k0wsooocks84/application/jwks4w8sscs4c8ckkccsok04

2. Удалите текущее приложение (Settings → Delete Application)

### Шаг 2: Создать новое Docker Compose приложение

1. В Environment создайте новый ресурс
2. Выберите тип: **"Docker Compose"** (НЕ "Application")
3. Source: GitHub
   - Repository: `https://github.com/emirkhayam/aurva.git`
   - Branch: `master`
   - Docker Compose file: `docker-compose.yml` (в корне проекта)

### Шаг 3: Настроить домен

1. В настройках Domains добавьте:
   - Domain: `aurva.kg`
   - Port: оставьте пустым (Traefik будет использовать labels из docker-compose.yml)

### Шаг 4: Добавить переменные окружения

Добавьте ВСЕ эти переменные в Environment Variables:

```bash
# Backend URL (важно для admin-panel build)
BACKEND_URL=http://backend:3000

# JWT Configuration
JWT_SECRET=SX6aA69J35iHTBfOXkZT70AN4YnsPq4y
JWT_EXPIRES_IN=7d

# Supabase Configuration
SUPABASE_URL=https://supabasekong-a048ksg80wksowg4s0skogcw.aurva.kg
SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MjcxNDE2MCwiZXhwIjo0OTI4Mzg3NzYwLCJyb2xlIjoiYW5vbiJ9.c0IVF8EW1Fbu_BpAVhzNIOz2ILVSNH4GwXTob9sUdz8
SUPABASE_SERVICE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MjcxNDE2MCwiZXhwIjo0OTI4Mzg3NzYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.q8zI5BCSecVpWENTlewQB3wV4zola45Pt2U5j9bmvyw

# Supabase Postgres Configuration
POSTGRES_HOST=supabase-db-a048ksg80wksowg4s0skogcw
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=q5rat5j7VaOE0qE8Qx9ZXklFzSeXYVY6
POSTGRES_SSL=false

# Node Environment
NODE_ENV=production

# Auth Configuration
AUTH_JWT_SECRET=SX6aA69J35iHTBfOXkZT70AN4YnsPq4y
GOTRUE_SITE_URL=https://supabasekong-a048ksg80wksowg4s0skogcw.aurva.kg

# Storage (MinIO)
MINIO_ROOT_USER=mQtzVOY7iA1RpPmA
MINIO_ROOT_PASSWORD=Hqg7oy2tShDfWksk6ffUdUNOwfMPsMjL
AWS_ACCESS_KEY_ID=mQtzVOY7iA1RpPmA
AWS_SECRET_ACCESS_KEY=Hqg7oy2tShDfWksk6ffUdUNOwfMPsMjL

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

# CORS
CORS_ORIGIN=*
```

### Шаг 5: Настроить сети (Networks)

Убедитесь, что приложение подключено к сетям:
1. **coolify** (должна быть автоматически)
2. **a048ksg80wksowg4s0skogcw** (Supabase network)
   - Добавить вручную в настройках Networks
   - External network: `a048ksg80wksowg4s0skogcw`

### Шаг 6: Deploy

1. Сохраните все настройки
2. Нажмите **"Deploy"**
3. Дождитесь завершения сборки (5-10 минут)
4. Проверьте логи обоих контейнеров (backend и admin-panel)

## АЛЬТЕРНАТИВНЫЙ СПОСОБ (если Docker Compose не работает в UI)

Если Coolify не поддерживает Docker Compose через UI, можно развернуть вручную через SSH:

### Via SSH:

```bash
# 1. Connect to aurva-coolify VM
ssh root@135.181.112.60
ssh alan@10.10.10.101

# 2. Create project directory
sudo mkdir -p /data/projects/aurva
cd /data/projects/aurva

# 3. Clone repository
sudo git clone https://github.com/emirkhayam/aurva.git .
sudo git checkout master
sudo git pull

# 4. Create .env file
sudo tee .env > /dev/null <<EOF
# Backend URL
BACKEND_URL=http://backend:3000

# JWT Configuration
JWT_SECRET=SX6aA69J35iHTBfOXkZT70AN4YnsPq4y
JWT_EXPIRES_IN=7d

# Supabase Configuration
SUPABASE_URL=https://supabasekong-a048ksg80wksowg4s0skogcw.aurva.kg
SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MjcxNDE2MCwiZXhwIjo0OTI4Mzg3NzYwLCJyb2xlIjoiYW5vbiJ9.c0IVF8EW1Fbu_BpAVhzNIOz2ILVSNH4GwXTob9sUdz8
SUPABASE_SERVICE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MjcxNDE2MCwiZXhwIjo0OTI4Mzg3NzYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.q8zI5BCSecVpWENTlewQB3wV4zola45Pt2U5j9bmvyw

# Postgres Configuration
POSTGRES_HOST=supabase-db-a048ksg80wksowg4s0skogcw
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=q5rat5j7VaOE0qE8Qx9ZXklFzSeXYVY6
POSTGRES_SSL=false

# Node Environment
NODE_ENV=production

# Auth Configuration
AUTH_JWT_SECRET=SX6aA69J35iHTBfOXkZT70AN4YnsPq4y
GOTRUE_SITE_URL=https://supabasekong-a048ksg80wksowg4s0skogcw.aurva.kg

# Storage
MINIO_ROOT_USER=mQtzVOY7iA1RpPmA
MINIO_ROOT_PASSWORD=Hqg7oy2tShDfWksk6ffUdUNOwfMPsMjL
AWS_ACCESS_KEY_ID=mQtzVOY7iA1RpPmA
AWS_SECRET_ACCESS_KEY=Hqg7oy2tShDfWksk6ffUdUNOwfMPsMjL

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=aurva.kg@gmail.com
EMAIL_PASSWORD=your_email_password_here
EMAIL_FROM=aurva.kg@gmail.com

# Admin
ADMIN_EMAIL=admin@aurva.kg
ADMIN_PASSWORD=admin123

# CORS
CORS_ORIGIN=*
EOF

# 5. Create Supabase network if not exists
sudo docker network create a048ksg80wksowg4s0skogcw 2>/dev/null || echo "Network already exists"

# 6. Connect to existing networks
sudo docker network connect coolify || echo "Connected to coolify network"
sudo docker network connect a048ksg80wksowg4s0skogcw || echo "Connected to supabase network"

# 7. Stop old containers
sudo docker ps -a | grep jwks4w8sscs4c8ckkccsok04 | awk '{print $1}' | xargs -r sudo docker stop
sudo docker ps -a | grep jwks4w8sscs4c8ckkccsok04 | awk '{print $1}' | xargs -r sudo docker rm

# 8. Build and deploy
sudo docker-compose build --no-cache
sudo docker-compose up -d

# 9. Check status
sudo docker-compose ps
sudo docker-compose logs -f
```

## После деплоя - проверка:

1. **Check containers:**
```bash
sudo docker ps | grep -E "backend|admin"
```

Должно быть 2 контейнера:
- backend (Node.js на порту 3000)
- admin-panel (nginx на порту 80)

2. **Check logs:**
```bash
sudo docker-compose logs backend --tail 50
sudo docker-compose logs admin-panel --tail 50
```

Backend должен показать:
- ✅ Database connection established
- ✅ Server started on port 3000

3. **Test locally from VM:**
```bash
# Test backend
curl -I http://localhost:3000/health

# Test admin-panel
curl -I http://localhost/admin/
```

4. **Test externally:**
```bash
curl -I https://aurva.kg/
curl -I https://aurva.kg/admin/
```

## Ожидаемый результат:

- https://aurva.kg/ - должна отдавать админ-панель
- https://aurva.kg/admin/ - админ-панель
- https://aurva.kg/api/health - должен отдавать {"status":"ok"}
- Backend и admin-panel работают и связаны
- База данных Supabase подключена

## Текущее состояние (2026-03-06 17:55 UTC):

**На сервере:**
- ✅ Контейнер admin-panel запущен (nginx)
- ❌ Контейнер backend НЕ запущен
- ❌ Traefik routing сломан (пустой Host)
- ❌ Переменные окружения не настроены

**Проблема:** Coolify настроен неправильно - использует Single Container вместо Docker Compose

**Решение:** Следовать инструкциям выше для переконфигурации

---

Дата: 2026-03-06
Статус: Требуется ручная настройка в Coolify UI или развертывание через SSH
