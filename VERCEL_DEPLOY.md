# 🚀 Деплой AURVA на Vercel

## 📋 Что уже сделано:

✅ Git репозиторий инициализирован
✅ Все файлы закоммичены
✅ Backend запущен локально на http://localhost:3030
✅ Конфигурация Vercel создана

## 🎯 Следующие шаги:

### 1. Создать GitHub репозиторий

```bash
# Создайте новый репозиторий на GitHub: https://github.com/new
# Имя: aurva-main (или любое другое)

# Добавьте remote и запушьте код:
git remote add origin https://github.com/YOUR_USERNAME/aurva-main.git
git branch -M main
git push -u origin main
```

### 2. Деплой Admin Panel на Vercel

#### Через Web Interface (Рекомендуется):

1. Зайдите на https://vercel.com/
2. Нажмите "Add New" → "Project"
3. Импортируйте ваш GitHub репозиторий
4. **Важно!** Настройте Root Directory: `admin-panel`
5. Настройте Environment Variables:
   - `VITE_API_URL` = `https://aurva.kg/api` (или ваш backend URL)
6. Нажмите "Deploy"

#### Через CLI:

```bash
cd admin-panel

# Логин в Vercel
vercel login

# Деплой
vercel --prod

# Следуйте инструкциям:
# - Setup and deploy: Yes
# - Scope: Выберите ваш account
# - Link to existing project: No
# - Project name: aurva-admin
# - Directory: ./
# - Override settings: No
```

### 3. Деплой Backend на Railway/Render

Backend (Node.js/Express) лучше деплоить на:
- **Railway.app** (рекомендуется)
- **Render.com**
- **Heroku**

#### Railway:

```bash
# Установить Railway CLI
npm install -g @railway/cli

# Логин
railway login

# Инициализация
cd backend
railway init

# Деплой
railway up

# Добавить environment variables через Dashboard
```

#### Или через Railway Dashboard:

1. https://railway.app/new
2. Deploy from GitHub repo
3. Выберите ваш репозиторий
4. Root Directory: `backend`
5. Добавьте Environment Variables из `.env`:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_KEY
   - PORT=3030
6. Deploy

### 4. Обновить CORS

После деплоя обновите CORS в `backend/.env`:

```env
CORS_ORIGIN=https://your-admin-panel.vercel.app,https://aurva.kg,https://www.aurva.kg
```

### 5. Обновить API URL в Admin Panel

На Vercel в настройках проекта:
1. Settings → Environment Variables
2. Обновите `VITE_API_URL` на ваш Railway/Render URL
3. Redeploy проект

## 📦 Структура деплоя:

```
Frontend (Public Site):    https://aurva.kg (Coolify/Current server)
Admin Panel:                https://aurva-admin.vercel.app (Vercel)
Backend API:                https://aurva-backend.railway.app (Railway)
Database:                   Supabase (уже работает)
```

## 🔗 Полезные ссылки:

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Railway Dashboard:** https://railway.app/dashboard
- **Render Dashboard:** https://dashboard.render.com/
- **Supabase Dashboard:** https://app.supabase.com/

## ⚠️ Important Notes:

1. **Backend:** Не деплойте Node.js backend на Vercel (он для serverless functions)
2. **Environment Variables:** Не забудьте добавить все переменные окружения
3. **CORS:** Обновите CORS_ORIGIN после получения URLs
4. **Build Command:** Admin panel: `npm run build`
5. **Start Command:** Backend: `npm start`

## 🎉 Готово!

После деплоя у вас будет:
- ✅ Admin Panel на Vercel
- ✅ Backend API на Railway
- ✅ Public Site на вашем сервере
- ✅ Database на Supabase

Все работает!
