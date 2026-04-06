# 🚀 Настройка автоматического деплоя на Coolify для c.aurva.kg

Полное руководство по настройке автоматического развертывания проекта AURVA на Coolify.

## 📋 Содержание

1. [Подготовка репозитория](#подготовка-репозитория)
2. [Настройка в Coolify](#настройка-в-coolify)
3. [Настройка переменных окружения](#настройка-переменных-окружения)
4. [Запуск деплоя](#запуск-деплоя)
5. [Проверка работы](#проверка-работы)

---

## 📦 Подготовка репозитория

### 1. Коммит всех изменений

```bash
# В локальной папке проекта
cd C:\Users\user\Desktop\aurva-main

# Добавить все файлы
git add .

# Создать коммит
git commit -m "Setup production deployment for c.aurva.kg with Coolify"

# Отправить на GitHub
git push origin main
```

### 2. Проверка файлов

Убедитесь что следующие файлы присутствуют в репозитории:
- ✅ `.coolify.yml` - конфигурация Coolify
- ✅ `docker-compose.production.yml` - production конфигурация
- ✅ `.env.production` - пример переменных окружения
- ✅ `.github/workflows/deploy.yml` - GitHub Actions для проверки
- ✅ `deploy.sh` - скрипт для ручного деплоя

---

## 🎯 Настройка в Coolify

### Шаг 1: Войдите в Coolify

Откройте панель Coolify (обычно доступна на вашем сервере):
```
https://coolify.ваш-сервер.com
```

### Шаг 2: Создание нового проекта

1. Нажмите **"+ New Project"** или **"Projects"** → **"+ Add"**
2. Выберите **"Docker Compose"** тип проекта
3. Введите название: **AURVA Production**

### Шаг 3: Подключение GitHub репозитория

1. В разделе **"Source"**:
   - Выберите **"GitHub"**
   - Нажмите **"Connect GitHub"** (если еще не подключено)
   - Авторизуйте доступ к репозиторию
   - Выберите ваш репозиторий с проектом AURVA

2. Настройте Branch:
   - **Branch:** `main` (или `production` если используете отдельную ветку)

### Шаг 4: Настройка Docker Compose

1. В разделе **"Build Settings"**:
   - **Build Method:** Docker Compose
   - **Compose File Path:** `docker-compose.production.yml`

2. Дополнительные настройки:
   - **Auto Deploy:** ✅ Включено (деплой при каждом push)
   - **Build on Push:** ✅ Включено

### Шаг 5: Настройка домена

1. Перейдите в раздел **"Domains"**
2. Добавьте домены:
   - `c.aurva.kg`
   - `www.c.aurva.kg` (опционально)

3. Настройте SSL:
   - ✅ **Enable SSL** (Let's Encrypt)
   - ✅ **Force HTTPS**

---

## 🔐 Настройка переменных окружения

### Шаг 1: Перейдите в раздел Environment Variables

В вашем проекте найдите раздел **"Environment Variables"** или **"Secrets"**

### Шаг 2: Добавьте все необходимые переменные

**ВАЖНО:** Скопируйте переменные из `.env.production` и обязательно измените секретные значения!

#### Supabase Configuration (из вашего файла)

```bash
SUPABASE_URL=https://vtkyejkhezzktzguojbr.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0a3llamtoZXp6a3R6Z3VvamJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjk1MDcsImV4cCI6MjA4ODYwNTUwN30.czHwMl0VwtIAqxTWouX-bRRyvE-20YP8jngItXdzLhY
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0a3llamtoZXp6a3R6Z3VvamJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzAyOTUwNywiZXhwIjoyMDg4NjA1NTA3fQ.zU0V8QYLItofJZEsHUWOK7pwCM18NbWiDMbdkyqBPFs
```

#### Postgres Configuration

```bash
POSTGRES_HOST=aws-0-eu-central-1.pooler.supabase.com
POSTGRES_PORT=6543
POSTGRES_DB=postgres
POSTGRES_USER=postgres.vtkyejkhezzktzguojbr
POSTGRES_PASSWORD=egD.SYGb.F5Hm3r
POSTGRES_SSL=true
```

#### Storage Configuration

```bash
STORAGE_BUCKET=uploads
```

#### JWT Configuration (⚠️ ОБЯЗАТЕЛЬНО ИЗМЕНИТЕ!)

**Сгенерируйте новые случайные значения:**

```bash
# В терминале сервера выполните:
openssl rand -base64 32
```

Затем добавьте в Coolify:

```bash
JWT_SECRET=ваш-сгенерированный-секрет-32-символа
AUTH_JWT_SECRET=другой-сгенерированный-секрет-32-символа
JWT_EXPIRES_IN=7d
```

#### Domain & CORS Configuration

```bash
GOTRUE_SITE_URL=https://c.aurva.kg
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://c.aurva.kg,https://www.c.aurva.kg
```

#### Email Configuration (⚠️ НАСТРОЙТЕ СВОИ)

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=ваш-email@gmail.com
EMAIL_PASSWORD=ваш-app-password-от-gmail
EMAIL_FROM=AURVA <noreply@aurva.kg>
```

**Как получить App Password для Gmail:**
1. Перейдите: https://myaccount.google.com/apppasswords
2. Включите 2FA если еще не включено
3. Создайте App Password для "Mail"
4. Используйте этот пароль в `EMAIL_PASSWORD`

#### Admin Credentials (⚠️ ОБЯЗАТЕЛЬНО ИЗМЕНИТЕ ПАРОЛЬ!)

```bash
ADMIN_EMAIL=admin@aurva.kg
ADMIN_PASSWORD=ваш-надежный-пароль-минимум-12-символов
```

#### Storage (AWS/MinIO) - опционально

```bash
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
```

#### Backend URL (для внутренней связи)

```bash
BACKEND_URL=http://backend:3000
```

---

## 🚀 Запуск деплоя

### Автоматический деплой (рекомендуется)

После настройки в Coolify, каждый push в ветку `main` будет автоматически запускать деплой:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Coolify автоматически:
1. ✅ Получит последние изменения из GitHub
2. ✅ Соберет Docker образы
3. ✅ Запустит контейнеры
4. ✅ Проверит healthcheck
5. ✅ Обновит маршрутизацию

### Ручной деплой через Coolify UI

1. Откройте ваш проект в Coolify
2. Нажмите кнопку **"Deploy"** или **"Redeploy"**
3. Дождитесь завершения процесса
4. Проверьте логи в реальном времени

### Ручной деплой на сервере

Если вы хотите развернуть вручную на сервере:

```bash
# SSH подключение к серверу
ssh user@c.aurva.kg

# Клонирование репозитория (если еще не сделано)
git clone <URL-репозитория> aurva
cd aurva

# Запуск деплой скрипта
./deploy.sh
```

---

## ✅ Проверка работы

### 1. Проверка в Coolify Dashboard

В Coolify UI проверьте:
- ✅ Статус деплоя: **Running**
- ✅ Healthcheck: **Healthy**
- ✅ Логи: без критических ошибок

### 2. Проверка в браузере

Откройте следующие URL:

1. **Главная страница:**
   ```
   https://c.aurva.kg/
   ```
   Должна открыться главная страница (редирект на /admin)

2. **Админ панель:**
   ```
   https://c.aurva.kg/admin
   ```
   Должна открыться форма входа

3. **API Health:**
   ```
   https://c.aurva.kg/api/health
   ```
   Должно вернуться: `{"status":"ok"}`

4. **Backend Health:**
   ```
   https://c.aurva.kg/health
   ```
   Должно вернуться: `OK`

### 3. Вход в админ панель

1. Перейдите на https://c.aurva.kg/admin
2. Используйте учетные данные:
   - **Email:** значение `ADMIN_EMAIL` из переменных окружения
   - **Password:** значение `ADMIN_PASSWORD` из переменных окружения

### 4. Проверка логов

В Coolify:
1. Откройте ваш проект
2. Перейдите в **"Logs"** или **"Console"**
3. Выберите контейнер:
   - `backend` - логи API сервера
   - `admin-panel` - логи Nginx

Или через SSH:
```bash
# Все логи
docker compose -f docker-compose.production.yml logs -f

# Только backend
docker compose -f docker-compose.production.yml logs -f backend

# Только admin-panel
docker compose -f docker-compose.production.yml logs -f admin-panel
```

---

## 🔄 Обновление проекта

### Автоматическое обновление

Просто сделайте push в репозиторий:

```bash
# Внесите изменения в код
# Затем:
git add .
git commit -m "Update: ваше описание изменений"
git push origin main

# Coolify автоматически задеплоит новую версию
```

### Ручное обновление через Coolify

1. В Coolify UI откройте проект
2. Нажмите **"Deploy"** → **"Force Deploy"**
3. Или нажмите **"Pull & Deploy"**

### Откат к предыдущей версии

1. В Coolify перейдите в **"Deployments"** или **"History"**
2. Найдите предыдущую успешную версию
3. Нажмите **"Rollback"** или **"Redeploy"**

---

## 🐛 Troubleshooting

### Проблема: Деплой падает с ошибкой

1. **Проверьте логи в Coolify:**
   - Откройте раздел "Logs"
   - Найдите красные строки с ошибками

2. **Частые причины:**
   - Отсутствуют обязательные переменные окружения
   - Неправильный формат `.coolify.yml`
   - Ошибки в `docker-compose.production.yml`

### Проблема: Сайт не открывается

1. **Проверьте DNS:**
   ```bash
   nslookup c.aurva.kg
   ```
   Должен вернуть IP вашего сервера

2. **Проверьте SSL сертификат:**
   - В Coolify убедитесь что SSL включен
   - Let's Encrypt может занять несколько минут

3. **Проверьте файрвол на сервере:**
   ```bash
   sudo ufw status
   # Убедитесь что порты 80 и 443 открыты
   ```

### Проблема: Ошибка подключения к базе данных

1. **Проверьте переменные Supabase:**
   - `POSTGRES_HOST`
   - `POSTGRES_USER`
   - `POSTGRES_PASSWORD`

2. **Проверьте в логах backend:**
   ```bash
   docker compose logs backend | grep -i error
   ```

### Проблема: 502 Bad Gateway

1. **Backend не запустился:**
   ```bash
   docker compose ps
   # Проверьте статус backend
   ```

2. **Проверьте healthcheck:**
   ```bash
   docker compose exec backend curl http://localhost:3000/health
   ```

---

## 📊 Мониторинг

### В Coolify Dashboard

Coolify предоставляет встроенный мониторинг:
- 📈 CPU usage
- 💾 Memory usage
- 💿 Disk usage
- 🌐 Network traffic
- 📝 Logs в реальном времени

### Настройка уведомлений

1. В Coolify перейдите в **"Settings"** → **"Notifications"**
2. Добавьте:
   - Email для алертов
   - Telegram bot (опционально)
   - Discord webhook (опционально)

### Healthcheck

Coolify автоматически проверяет здоровье сервисов:
- Интервал: каждые 30 секунд
- Endpoint: `/health`
- Таймаут: 10 секунд

---

## 🔒 Безопасность

### Чеклист безопасности:

- ✅ Изменены все секретные ключи (JWT_SECRET, AUTH_JWT_SECRET)
- ✅ Изменен пароль администратора (ADMIN_PASSWORD)
- ✅ Настроен HTTPS с Let's Encrypt
- ✅ Force HTTPS включен
- ✅ CORS настроен только для вашего домена
- ✅ Переменные окружения не попадают в Git
- ✅ Используется .env файл (не .env.production с секретами)

### Рекомендации:

1. **Регулярные бэкапы:**
   - Настройте автоматические бэкапы в Coolify
   - Бэкапьте volumes с uploads

2. **Обновления:**
   - Регулярно обновляйте зависимости
   - Следите за обновлениями Docker образов

3. **Логи:**
   - Настройте ротацию логов
   - Мониторьте подозрительную активность

---

## 📞 Поддержка

### Полезные ресурсы:

- 📖 [Coolify Documentation](https://coolify.io/docs)
- 📖 [Docker Compose Documentation](https://docs.docker.com/compose/)
- 📖 AURVA Backend: `backend/README.md`
- 📖 AURVA Deployment: `DEPLOY_C_AURVA_KG.md`

### Контакты:

- Email: aurva.kg@gmail.com
- GitHub Issues: <ваш-репозиторий>/issues

---

## 🎉 Готово!

Ваш проект AURVA успешно настроен для автоматического деплоя на Coolify!

**Что дальше:**

1. ✅ Настройте переменные окружения в Coolify
2. ✅ Сделайте первый push для запуска деплоя
3. ✅ Проверьте работу сайта на https://c.aurva.kg
4. ✅ Войдите в админ панель
5. ✅ Настройте уведомления и мониторинг
6. ✅ Наслаждайтесь автоматическими деплоями! 🚀

---

**Создано с ❤️ для AURVA**
