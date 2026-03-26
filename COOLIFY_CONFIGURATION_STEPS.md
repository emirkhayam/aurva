# Пошаговая настройка AURVA в Coolify

## Проблема
Приложение настроено неправильно в Coolify - развернут только один контейнер вместо полного Docker Compose stack (backend + admin-panel), и нет подключения к Supabase.

## Решение

### Шаг 1: Откройте настройки приложения

URL приложения: https://coolify.aurva.kg/project/awc4s8scwo8swwgw84wc8s0w/environment/o40ccc04kog0k0wsooocks84/application/jwks4w8sscs4c8ckkccsok04

### Шаг 2: Проверьте тип приложения

1. Перейдите в **"General"** настройки приложения
2. Проверьте **"Build Pack"** или **"Type"**
3. Должно быть: **"Docker Compose"**
4. Если стоит что-то другое (например, "Dockerfile" или "Nixpacks"):
   - Нужно пересоздать приложение с правильным типом

### Шаг 3: Настройка Source

В разделе **"Source"**:
- Repository: `https://github.com/emirkhayam/aurva.git`
- Branch: `master`
- Docker Compose Location: `docker-compose.yml` (в корне проекта)

### Шаг 4: Настройка Domains

В разделе **"Domains"**:
1. Удалите все неправильные домены
2. Добавьте домен: `aurva.kg`
3. Port: оставьте пустым (Traefik использует labels из docker-compose.yml)
4. Сохраните

### Шаг 5: Настройка Networks

**ОЧЕНЬ ВАЖНО!** Приложение должно быть подключено к сети Supabase.

В разделе **"Networks"**:
1. Убедитесь, что подключена сеть `coolify` (должна быть по умолчанию)
2. **Добавьте внешнюю сеть Supabase:**
   - Нажмите "Add Network"
   - Type: External
   - Network Name: `a048ksg80wksowg4s0skogcw`

   **Важно:** Это UUID сети Supabase из: https://coolify.aurva.kg/project/awc4s8scwo8swwgw84wc8s0w/environment/o40ccc04kog0k0wsooocks84/service/a048ksg80wksowg4s0skogcw

### Шаг 6: Настройка Environment Variables

В разделе **"Environment Variables"** добавьте ВСЕ эти переменные:

```env
BACKEND_URL=http://backend:3000
JWT_SECRET=SX6aA69J35iHTBfOXkZT70AN4YnsPq4y
JWT_EXPIRES_IN=7d
NODE_ENV=production

# Supabase Configuration
SUPABASE_URL=https://supabasekong-a048ksg80wksowg4s0skogcw.aurva.kg
SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MjcxNDE2MCwiZXhwIjo0OTI4Mzg3NzYwLCJyb2xlIjoiYW5vbiJ9.c0IVF8EW1Fbu_BpAVhzNIOz2ILVSNH4GwXTob9sUdz8
SUPABASE_SERVICE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MjcxNDE2MCwiZXhwIjo0OTI4Mzg3NzYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.q8zI5BCSecVpWENTlewQB3wV4zola45Pt2U5j9bmvyw

# Supabase PostgreSQL
POSTGRES_HOST=supabase-db-a048ksg80wksowg4s0skogcw
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=q5rat5j7VaOE0qE8Qx9ZXklFzSeXYVY6
POSTGRES_SSL=false

# Auth
AUTH_JWT_SECRET=SX6aA69J35iHTBfOXkZT70AN4YnsPq4y
GOTRUE_SITE_URL=https://supabasekong-a048ksg80wksowg4s0skogcw.aurva.kg

# Storage (MinIO)
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
```

**Как добавить переменные:**
1. Нажмите "Add Variable"
2. Key: имя переменной (например, `BACKEND_URL`)
3. Value: значение переменной (например, `http://backend:3000`)
4. Повторите для всех переменных выше
5. Нажмите "Save"

### Шаг 7: Проверка docker-compose.yml в репозитории

Убедитесь, что в вашем `docker-compose.yml` правильно указаны сети:

```yaml
networks:
  coolify:
    external: true
    name: coolify
  supabase:
    external: true
    name: a048ksg80wksowg4s0skogcw  # UUID сети Supabase
  internal:
    driver: bridge
```

**Файл уже обновлен в репозитории!** (commit 47a92a4)

### Шаг 8: Deploy

1. После настройки всех параметров нажмите **"Deploy"** или **"Redeploy"**
2. Дождитесь завершения сборки (5-10 минут)
3. Следите за логами сборки на предмет ошибок

### Шаг 9: Мониторинг логов

После деплоя проверьте логи:

**Backend logs:**
- Должны показать: ✅ Database connection established
- Должны показать: ✅ Server started on port 3000

**Admin-panel logs:**
- Nginx должен запуститься без ошибок

### Шаг 10: Проверка

После успешного деплоя проверьте:

1. **Главная страница:** https://aurva.kg/
   - Должна загрузиться админ-панель

2. **Админ-панель:** https://aurva.kg/admin/
   - Должна открыться страница входа

3. **API Health:** https://aurva.kg/api/health (может не работать через браузер)
   - Должен вернуть `{"status":"ok"}`

4. **Вход в админку:**
   - Email: `admin@aurva.kg`
   - Password: `admin123`

## Альтернатива: Пересоздать приложение

Если текущее приложение невозможно переконфигурировать на Docker Compose:

### 1. Удалите текущее приложение
- Settings → Delete Application

### 2. Создайте новое
1. В Environment нажмите **"+ New Resource"**
2. Выберите **"Docker Compose"**
3. Source:
   - Type: Git Repository
   - Repository: `https://github.com/emirkhayam/aurva.git`
   - Branch: `master`
   - Docker Compose file: `docker-compose.yml`
4. Следуйте шагам 4-9 выше

## Важные замечания

### О сетях:
- **coolify** - сеть для Traefik маршрутизации (создается автоматически)
- **a048ksg80wksowg4s0skogcw** - сеть Supabase (должна быть добавлена вручную)
- **internal** - внутренняя сеть для связи backend ↔ admin-panel (создается автоматически)

### О доменах:
- Traefik labels в docker-compose.yml настроены на `aurva.kg`
- НЕ нужно указывать порты для каждого сервиса отдельно
- Labels из docker-compose.yml будут использованы автоматически

### О переменных окружения:
- Переменные должны быть доступны ВСЕМ контейнерам
- Coolify автоматически передаст их в docker-compose
- Build arguments для admin-panel будут подставлены во время сборки

## Ожидаемый результат

После правильной настройки:

```
✅ 2 контейнера запущены:
   - backend (Node.js на порту 3000)
   - admin-panel (nginx на порту 80)

✅ Сети подключены:
   - coolify (для Traefik)
   - a048ksg80wksowg4s0skogcw (для Supabase)
   - internal (для межсервисной связи)

✅ Traefik routing работает:
   - aurva.kg → admin-panel (nginx)
   - aurva.kg/api/* → backend (Node.js)

✅ Backend подключен к Supabase PostgreSQL

✅ Сайт доступен по https://aurva.kg/
```

## Troubleshooting

### Проблема: "Network not found"
**Решение:** Убедитесь, что сеть Supabase существует и имеет UUID `a048ksg80wksowg4s0skogcw`

Проверьте в Coolify:
https://coolify.aurva.kg/project/awc4s8scwo8swwgw84wc8s0w/environment/o40ccc04kog0k0wsooocks84/service/a048ksg80wksowg4s0skogcw

### Проблема: "Build failed"
**Решение:** Проверьте логи сборки. Обычно проблема в отсутствующих переменных окружения для admin-panel build.

### Проблема: "502 Bad Gateway"
**Решение:**
1. Проверьте, что оба контейнера запущены
2. Проверьте логи backend - подключился ли к БД
3. Проверьте health check backend: должен отвечать на порту 3000

### Проблема: "Database connection failed"
**Решение:**
1. Проверьте, что приложение подключено к сети `a048ksg80wksowg4s0skogcw`
2. Проверьте, что Supabase сервис запущен
3. Проверьте переменные POSTGRES_* в Environment Variables

## Контакты для помощи

После выполнения всех шагов, если проблема остается:
1. Сделайте скриншот настроек Networks в Coolify
2. Сделайте скриншот Environment Variables
3. Скопируйте логи ошибок из Deployment Logs
4. Проверьте статус Supabase сервиса

---

**Дата:** 2026-03-06
**Статус:** Готово к применению
**GitHub:** Все изменения запушены в master branch
