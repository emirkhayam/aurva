# Настройка Supabase на домен s.aurva.kg

## Цель
Настроить Supabase сервис на публичный домен `s.aurva.kg`, чтобы приложение AURVA могло подключаться к базе данных из любой VM.

## Шаги в Coolify UI

### 1. Откройте Supabase Service

URL: https://coolify.aurva.kg/project/awc4s8scwo8swwgw84wc8s0w/environment/o40ccc04kog0k0wsooocks84/service/a048ksg80wksowg4s0skogcw

### 2. Настройте домены для каждого компонента

В разделе **Domains** или **URLs** для каждого сервиса Supabase:

#### Supabase Kong (API Gateway)
- Текущий: `https://supabasekong-a048ksg80wksowg4s0skogcw.aurva.kg`
- **Новый:** `https://s.aurva.kg`
- Это основной endpoint для API

#### Supabase Studio (Admin UI)
- **Добавить:** `https://studio.s.aurva.kg`

#### Supabase Auth (GoTrue)
- **Добавить:** `https://auth.s.aurva.kg`

### 3. Настройка PostgreSQL для внешнего доступа

PostgreSQL обычно не должен быть доступен напрямую извне по соображениям безопасности, но если нужен прямой доступ:

**Вариант A: Через Coolify Proxy (Рекомендуется)**
- Добавить TCP прокси для PostgreSQL порта 5432
- Домен: `db.s.aurva.kg:5432`

**Вариант B: Использовать только API подключение**
- Использовать Supabase API через Kong (`https://s.aurva.kg`)
- Это более безопасный вариант

### 4. Обновите переменные окружения Supabase

В настройках Supabase service обновите:

```env
SUPABASE_PUBLIC_URL=https://s.aurva.kg
KONG_HTTP_URL=https://s.aurva.kg
GOTRUE_SITE_URL=https://s.aurva.kg
GOTRUE_URI_ALLOW_LIST=https://s.aurva.kg,https://aurva.kg
```

### 5. Сохраните и перезапустите сервис

1. Нажмите **"Save"**
2. Нажмите **"Redeploy"** или **"Restart"**
3. Дождитесь завершения перезапуска (2-3 минуты)

### 6. Проверьте доступность

После настройки проверьте:

```bash
# Проверка Kong API
curl -I https://s.aurva.kg

# Проверка Auth endpoint
curl https://auth.s.aurva.kg/health

# Проверка Studio
curl -I https://studio.s.aurva.kg
```

## Получение данных для подключения

После настройки домена вам нужно получить:

### 1. Connection String для PostgreSQL

Если настроили прямой доступ к PostgreSQL:
```
postgresql://postgres:PASSWORD@db.s.aurva.kg:5432/postgres
```

Где `PASSWORD` - это пароль PostgreSQL из переменной `POSTGRES_PASSWORD`

### 2. Supabase API Keys

В Coolify найдите переменные окружения Supabase:
- `SUPABASE_ANON_KEY` - публичный ключ для клиента
- `SUPABASE_SERVICE_ROLE_KEY` - приватный ключ для сервера

### 3. Обновите .env проекта AURVA

После того как Supabase будет доступен на `s.aurva.kg`:

```env
# Supabase Configuration
SUPABASE_URL=https://s.aurva.kg
SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
SUPABASE_SERVICE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...

# PostgreSQL Direct Connection (если настроили)
POSTGRES_HOST=db.s.aurva.kg
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=q5rat5j7VaOE0qE8Qx9ZXklFzSeXYVY6
POSTGRES_SSL=true

# Auth
AUTH_JWT_SECRET=SX6aA69J35iHTBfOXkZT70AN4YnsPq4y
GOTRUE_SITE_URL=https://s.aurva.kg
```

## Альтернативный подход: PostgreSQL через SSH туннель

Если не хотите открывать PostgreSQL напрямую в интернет:

### На VM где развернут AURVA:

```bash
# Создать SSH туннель к Supabase PostgreSQL
ssh -L 5432:supabase-db-a048ksg80wksowg4s0skogcw:5432 user@coolify-host -N -f

# Тогда POSTGRES_HOST будет localhost
POSTGRES_HOST=localhost
```

## Проверка после настройки

После того как все настроено, проверьте:

1. **Supabase API доступен:**
```bash
curl https://s.aurva.kg/rest/v1/
```

2. **PostgreSQL доступен (если настроили):**
```bash
psql "postgresql://postgres:PASSWORD@db.s.aurva.kg:5432/postgres" -c "SELECT 1;"
```

3. **Studio доступен:**
Откройте в браузере: https://studio.s.aurva.kg

## После настройки Supabase - что дальше

1. Я обновлю конфигурацию AURVA с новыми данными
2. Пересоберу Docker образы
3. Задеплою приложение
4. Проверю что все работает на https://aurva.kg/

## Важные замечания

### Безопасность

- ✅ Kong API (s.aurva.kg) - безопасно открывать, использует JWT
- ✅ Studio (studio.s.aurva.kg) - защищен паролем
- ⚠️ PostgreSQL напрямую (db.s.aurva.kg) - открывайте только если необходимо
- 🔒 Используйте SSL для всех подключений к PostgreSQL

### DNS

Убедитесь что DNS записи для:
- `s.aurva.kg`
- `studio.s.aurva.kg` (опционально)
- `auth.s.aurva.kg` (опционально)
- `db.s.aurva.kg` (если нужен прямой доступ к БД)

Указывают на сервер где развернут Coolify.

### Firewall

Если используете прямое подключение к PostgreSQL, откройте порт 5432 в файрволе.

---

## Что мне нужно от вас

После настройки Supabase на домен `s.aurva.kg` в Coolify UI, пришлите мне:

1. ✅ Подтверждение что домен настроен
2. ✅ Connection string для PostgreSQL (если настроили прямой доступ):
   ```
   postgresql://postgres:PASSWORD@HOST:PORT/postgres
   ```
3. ✅ Либо просто скажите "готово" и я использую API endpoint `https://s.aurva.kg`

После этого я обновлю конфигурацию AURVA и задеплою рабочую версию на https://aurva.kg/ ✨

---

**Дата:** 2026-03-06
**Статус:** Ожидает настройки Supabase в Coolify UI
