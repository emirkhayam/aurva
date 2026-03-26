# 🚂 Railway Deployment Guide для AURVA

Пошаговая инструкция по развёртыванию AURVA Backend на Railway.

---

## 📋 Предварительные требования

- [x] Аккаунт GitHub (проект должен быть в репозитории)
- [x] Аккаунт Railway (зарегистрируйтесь на [railway.app](https://railway.app))
- [ ] Gmail App Password для email уведомлений
- [ ] Безопасный JWT_SECRET (сгенерируем ниже)

---

## 🎯 Шаг 1: Подготовка проекта

### 1.1 Проверьте структуру проекта

Убедитесь что у вас есть:
```
backend/
├── Dockerfile              ✅ Создан
├── railway.json            ✅ Создан
├── .dockerignore           ✅ Создан
├── .railwayignore          ✅ Создан
├── .env.railway.example    ✅ Создан (шаблон)
├── package.json            ✅ Есть
└── src/                    ✅ Исходный код
```

### 1.2 Закоммитьте изменения в Git

```bash
cd backend
git add .
git commit -m "Add Railway deployment configuration"
git push origin master
```

---

## 🚀 Шаг 2: Создание проекта на Railway

### 2.1 Войдите в Railway

1. Откройте [railway.app](https://railway.app)
2. Нажмите **"Login"** и войдите через GitHub
3. Нажмите **"New Project"**

### 2.2 Подключите GitHub репозиторий

1. Выберите **"Deploy from GitHub repo"**
2. Найдите ваш репозиторий `aurva - beta`
3. Выберите его и нажмите **"Deploy Now"**

### 2.3 Настройте Root Directory

Railway по умолчанию будет искать в корне проекта. Нам нужно указать `backend`:

1. В Railway Dashboard откройте ваш проект
2. Перейдите в **Settings** → **Service Settings**
3. Найдите **Root Directory**
4. Установите: `backend`
5. Нажмите **"Save"**

---

## 🗄️ Шаг 3: Настройка базы данных

### Вариант A: Railway PostgreSQL (рекомендуется для простоты)

1. В Railway Dashboard нажмите **"+ New"**
2. Выберите **"Database"** → **"Add PostgreSQL"**
3. Railway автоматически создаст PostgreSQL и установит переменную `DATABASE_URL`
4. Переменная будет автоматически доступна вашему сервису

### Вариант B: Использовать существующий Neon PostgreSQL

1. Скопируйте `DATABASE_URL` из вашего `backend/.env.vercel`
2. Добавьте как переменную окружения (следующий шаг)

---

## 🔐 Шаг 4: Настройка Environment Variables

### 4.1 Откройте Variables

1. В Railway Dashboard выберите ваш сервис (backend)
2. Перейдите на вкладку **"Variables"**
3. Нажмите **"+ New Variable"**

### 4.2 Добавьте обязательные переменные

#### Production Environment
```
NODE_ENV=production
```

#### Database (если используете Railway PostgreSQL)
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

#### Database (если используете Neon)
```
DATABASE_URL=postgresql://neondb_owner:PASSWORD@ep-polished-scene-aidvktov-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

#### JWT Configuration

Сгенерируйте безопасный ключ:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Добавьте:
```
JWT_SECRET=<ваш_сгенерированный_ключ>
JWT_EXPIRES_IN=7d
```

#### CORS Configuration
```
CORS_ORIGIN=*
```

Для production используйте конкретные домены:
```
CORS_ORIGIN=https://aurva.kg,https://admin.aurva.kg
```

#### Email Configuration

Создайте Gmail App Password:
1. Откройте https://myaccount.google.com/apppasswords
2. Выберите "Mail" и "Other (Custom name)"
3. Введите "Railway AURVA"
4. Скопируйте сгенерированный пароль

Добавьте переменные:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=aurva.kg@gmail.com
EMAIL_PASSWORD=<ваш_app_password>
EMAIL_FROM=aurva.kg@gmail.com
```

#### Admin Credentials
```
ADMIN_EMAIL=admin@aurva.kg
ADMIN_PASSWORD=<безопасный_пароль>
```

#### File Upload Settings
```
MAX_FILE_SIZE=5242880
UPLOAD_PATH=/app/uploads
```

### 4.3 Сохраните переменные

Railway автоматически перезапустит сервис после добавления переменных.

---

## 📦 Шаг 5: Настройка Persistent Storage

Для сохранения загруженных файлов (фото новостей, логотипы партнёров):

1. В Railway Dashboard выберите ваш сервис
2. Перейдите на вкладку **"Volumes"**
3. Нажмите **"+ New Volume"**
4. Установите:
   - **Mount Path:** `/app/uploads`
   - **Size:** 1 GB (или больше если нужно)
5. Нажмите **"Add"**

Railway автоматически смонтирует volume и перезапустит сервис.

---

## 🔨 Шаг 6: Deploy и проверка

### 6.1 Запустите деплой

Railway автоматически запустит build после настройки. Если нет:

1. Перейдите на вкладку **"Deployments"**
2. Нажмите **"Deploy"** на последнем коммите
3. Дождитесь завершения build (обычно 2-5 минут)

### 6.2 Проверьте логи

1. Откройте вкладку **"Logs"**
2. Убедитесь что нет ошибок
3. Ищите строку: `Server is running on port 5000`

### 6.3 Получите публичный URL

1. Перейдите на вкладку **"Settings"**
2. Найдите **"Domains"**
3. Нажмите **"Generate Domain"**
4. Railway создаст домен вида: `yourproject.up.railway.app`

### 6.4 Проверьте работу API

Откройте в браузере или через curl:

```bash
# Health Check
curl https://yourproject.up.railway.app/health

# API Info
curl https://yourproject.up.railway.app/

# Response должен быть:
# { "message": "AURVA Backend API", "version": "1.0.0" }
```

---

## 🎨 Шаг 7: Настройка Admin Panel

### 7.1 Обновите API URL

Откройте `admin-panel/.env`:
```env
VITE_API_URL=https://yourproject.up.railway.app/api
```

### 7.2 Build Admin Panel

```bash
cd admin-panel
npm install
npm run build
```

### 7.3 Деплой Admin Panel

**Вариант A: Vercel (рекомендуется для статики)**

```bash
cd admin-panel
npx vercel --prod
```

**Вариант B: Railway отдельным сервисом**

1. Создайте новый сервис в том же Railway проекте
2. Root Directory: `admin-panel`
3. Build Command: `npm install && npm run build`
4. Start Command: `npx serve dist -p $PORT`

---

## 🔗 Шаг 8: Настройка кастомного домена (опционально)

### 8.1 Добавьте домен

1. В Railway Settings → **Domains**
2. Нажмите **"Custom Domain"**
3. Введите ваш домен: `api.aurva.kg`
4. Railway покажет DNS записи

### 8.2 Настройте DNS

У вашего регистратора доменов (например, Cloudflare):

```
Type: CNAME
Name: api
Value: yourproject.up.railway.app
Proxy: Enabled (если Cloudflare)
```

### 8.3 Дождитесь активации

SSL сертификат будет выдан автоматически через 5-10 минут.

---

## 🧪 Шаг 9: Тестирование

### 9.1 Создайте тестовые данные

Railway не выполняет seed скрипты автоматически. Выполните вручную:

1. В Railway Dashboard откройте **"Logs"**
2. Подключитесь к контейнеру через Railway CLI:

```bash
# Установите Railway CLI
npm install -g @railway/cli

# Войдите
railway login

# Подключитесь к проекту
railway link

# Выполните seeding
railway run npm run seed:admin
railway run npm run seed:news
```

### 9.2 Проверьте функциональность

- [ ] Регистрация/вход в админку
- [ ] Создание новости с фото
- [ ] Просмотр новости на сайте
- [ ] Отправка формы обратной связи
- [ ] Получение email уведомления

---

## 💰 Стоимость Railway

### Pricing Tiers

**Hobby Plan (бесплатно):**
- $5 кредитов в месяц
- ~500 часов работы (для маленького проекта)
- Достаточно для тестирования

**Developer Plan ($5/месяц):**
- $5 кредитов + pay-as-you-go
- Unlimited deployments
- Рекомендуется для production

### Примерная стоимость для AURVA

```
Backend Service (512MB RAM): ~$3/месяц
PostgreSQL Database (256MB): ~$2/месяц
Volume Storage (1GB): ~$1/месяц
Total: ~$6-7/месяц
```

---

## 🔧 Troubleshooting

### Проблема: Build fails

**Причина:** TypeScript compilation errors

**Решение:**
```bash
cd backend
npm run build
# Исправьте ошибки и закоммитьте
```

### Проблема: Database connection timeout

**Причина:** Неправильный DATABASE_URL

**Решение:**
- Проверьте что DATABASE_URL установлен в Variables
- Проверьте что база данных активна
- Для Neon используйте pooler endpoint (`*-pooler`)

### Проблема: Uploads не сохраняются

**Причина:** Volume не подключен

**Решение:**
- Проверьте что Volume создан
- Mount path должен быть `/app/uploads`
- Перезапустите сервис после добавления volume

### Проблема: 502 Bad Gateway

**Причина:** Приложение не запустилось

**Решение:**
- Проверьте Logs на ошибки
- Убедитесь что все env переменные установлены
- Проверьте что PORT не установлен вручную (Railway установит автоматически)

### Проблема: Email не отправляются

**Причина:** Неправильный Gmail App Password

**Решение:**
- Создайте новый App Password в Google Account
- Не используйте обычный пароль от Gmail
- Проверьте что 2FA включен в Google аккаунте

---

## 📚 Дополнительные ресурсы

- [Railway Documentation](https://docs.railway.app/)
- [Railway Discord Community](https://discord.gg/railway)
- [Neon PostgreSQL Docs](https://neon.tech/docs)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

---

## ✅ Чек-лист готовности к Production

### Security
- [ ] JWT_SECRET сгенерирован безопасно
- [ ] ADMIN_PASSWORD достаточно сложный
- [ ] CORS_ORIGIN ограничен конкретными доменами
- [ ] Gmail App Password создан
- [ ] Database credentials безопасные

### Performance
- [ ] PostgreSQL connection pooling настроен
- [ ] Rate limiting активен
- [ ] Gzip compression включен
- [ ] Static assets кэшируются

### Monitoring
- [ ] Логи проверяются регулярно
- [ ] Health endpoint мониторится
- [ ] Backup базы данных настроен
- [ ] Uptime monitoring подключен (UptimeRobot)

### Functionality
- [ ] Все API endpoints работают
- [ ] File uploads сохраняются
- [ ] Email отправляются
- [ ] Admin panel доступен
- [ ] Public website работает

---

## 🎉 Готово!

Ваш AURVA Backend успешно развёрнут на Railway с:
- ✅ Persistent storage для uploads
- ✅ PostgreSQL database
- ✅ Zero cold starts
- ✅ Automatic SSL
- ✅ Easy scaling

**Следующие шаги:**
1. Настройте custom domain
2. Подключите monitoring
3. Настройте CI/CD через GitHub Actions
4. Оптимизируйте производительность

---

**Нужна помощь?** Обратитесь в Railway Discord или создайте issue на GitHub.
