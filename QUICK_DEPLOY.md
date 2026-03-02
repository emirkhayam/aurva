# 🚀 Quick Railway Deploy - 2 минуты

Упрощённая инструкция для быстрого деплоя AURVA на Railway.

---

## ⚡ Вариант 1: Автоматический деплой (рекомендуется)

### Для Windows (PowerShell):

```powershell
cd "C:\Users\user\Desktop\aurva - beta"
.\deploy-railway.ps1
```

### Для Linux/Mac:

```bash
cd ~/aurva-beta
chmod +x deploy-railway.sh
./deploy-railway.sh
```

**Скрипт автоматически:**
- ✅ Установит Railway CLI
- ✅ Авторизует вас через браузер
- ✅ Создаст проект
- ✅ Добавит PostgreSQL
- ✅ Настроит все переменные
- ✅ Создаст volume для uploads
- ✅ Задеплоит проект

**Что от вас нужно:**
1. Подтвердить авторизацию в браузере
2. Ввести Gmail credentials
3. Ввести admin credentials
4. Всё!

---

## ⚡ Вариант 2: Ручные команды (если скрипт не работает)

### Шаг 1: Установка Railway CLI

```bash
npm install -g @railway/cli
```

### Шаг 2: Логин

```bash
railway login
```

*Откроется браузер - подтвердите авторизацию*

### Шаг 3: Инициализация проекта

```bash
cd backend
railway init
```

Выберите:
- "Create a new project"
- Введите название: "aurva-backend"

### Шаг 4: Добавьте PostgreSQL

```bash
railway add --plugin postgresql
```

### Шаг 5: Настройте переменные окружения

```bash
# Сгенерируйте JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Установите переменные (замените YOUR_JWT_SECRET и остальные значения)
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=YOUR_JWT_SECRET
railway variables set JWT_EXPIRES_IN=7d
railway variables set CORS_ORIGIN="*"
railway variables set DATABASE_URL='${{Postgres.DATABASE_URL}}'
railway variables set EMAIL_HOST=smtp.gmail.com
railway variables set EMAIL_PORT=587
railway variables set EMAIL_SECURE=false
railway variables set EMAIL_USER=aurva.kg@gmail.com
railway variables set EMAIL_PASSWORD=YOUR_GMAIL_APP_PASSWORD
railway variables set EMAIL_FROM=aurva.kg@gmail.com
railway variables set ADMIN_EMAIL=admin@aurva.kg
railway variables set ADMIN_PASSWORD=YOUR_ADMIN_PASSWORD
railway variables set MAX_FILE_SIZE=5242880
railway variables set UPLOAD_PATH=/app/uploads
```

### Шаг 6: Создайте Volume

```bash
railway volume create uploads-volume --mount /app/uploads
```

### Шаг 7: Deploy!

```bash
railway up
```

### Шаг 8: Получите публичный URL

```bash
railway domain
```

---

## 🔍 Проверка деплоя

### Просмотр логов:

```bash
railway logs
```

### Проверка статуса:

```bash
railway status
```

### Открыть Dashboard:

```bash
railway open
```

---

## 🌐 Проверка API

После успешного деплоя получите URL:

```bash
railway domain
```

Проверьте:

```bash
# Health Check
curl https://your-project.up.railway.app/health

# API Info
curl https://your-project.up.railway.app/
```

Ожидаемый ответ:
```json
{
  "message": "AURVA Backend API",
  "version": "1.0.0"
}
```

---

## 📱 Настройка Admin Panel

После деплоя backend обновите `admin-panel/.env`:

```env
VITE_API_URL=https://your-project.up.railway.app/api
```

Затем задеплойте admin panel на Vercel:

```bash
cd ../admin-panel
npx vercel --prod
```

---

## 🔐 Важные данные (сохраните!)

После деплоя сохраните:

1. **Railway Project URL:** https://your-project.up.railway.app
2. **JWT_SECRET:** (сгенерированный ключ)
3. **Admin Credentials:** email + password
4. **Database URL:** доступен в Railway Dashboard → PostgreSQL

---

## 💰 Стоимость

Railway автоматически начнёт считать usage:

- **First month FREE:** $5 кредитов для новых пользователей
- **После:** ~$6-7/месяц для AURVA проекта

Проверить usage:
```bash
railway usage
```

---

## ❓ Troubleshooting

### Проблема: "Cannot find module @railway/cli"

**Решение:**
```bash
npm install -g @railway/cli
```

### Проблема: "Failed to login"

**Решение:**
- Закройте все вкладки Railway в браузере
- Попробуйте снова: `railway login`

### Проблема: "Database connection failed"

**Решение:**
```bash
# Проверьте что PostgreSQL добавлен
railway add --plugin postgresql

# Проверьте переменные
railway variables
```

### Проблема: "Deployment failed"

**Решение:**
```bash
# Проверьте логи
railway logs

# Часто это ошибки TypeScript
cd backend
npm run build
```

### Проблема: "Volume not working"

**Решение:**
```bash
# Пересоздайте volume
railway volume delete uploads-volume
railway volume create uploads-volume --mount /app/uploads

# Перезапустите сервис
railway up
```

---

## 📚 Полезные команды

```bash
# Просмотр всех проектов
railway list

# Переключение между проектами
railway link

# Просмотр переменных
railway variables

# Добавить переменную
railway variables set KEY=value

# Удалить переменную
railway variables delete KEY

# Откатить deployment
railway rollback

# Удалить проект
railway delete
```

---

## ✅ Готово!

Ваш AURVA Backend теперь работает на Railway с:
- ✅ Persistent storage для файлов
- ✅ PostgreSQL database
- ✅ Автоматический SSL
- ✅ Zero cold starts
- ✅ Публичный URL

**Следующие шаги:**
1. Настройте custom domain (опционально)
2. Задеплойте admin panel на Vercel
3. Запустите seeding: `railway run npm run seed:admin`
4. Проверьте все endpoints

---

**Нужна помощь?**
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: создайте issue в вашем репозитории
