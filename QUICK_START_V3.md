# 🚀 AURVA - Quick Start v3.0 (Упрощенная Архитектура)

## ⚡ За 2 Минуты

### 1️⃣ Установка

```bash
# Клонировать репозиторий
git clone <repo-url>
cd aurva

# Создать .env файл
cp .env.example .env
nano .env  # Заполнить переменные
```

### 2️⃣ Локальная Разработка

```bash
# Запустить backend (отдает все: сайт + API + админку)
docker-compose -f docker-compose.dev.yml up --build
```

**Доступ:**
- 🌐 Публичный сайт: http://localhost:3000
- 🌐 О нас: http://localhost:3000/about.html
- 🌐 Новости: http://localhost:3000/news.html
- 🔐 Админка: http://localhost:3000/admin
- 🔌 API: http://localhost:3000/api
- ❤️ Health: http://localhost:3000/health

### 3️⃣ Production Деплой

```bash
# На сервере (Coolify автоматически)
docker-compose up --build -d
```

## 📁 Простая Структура

```
aurva/
├── backend/              ← ВСЕ ЗДЕСЬ!
│   ├── src/              ← API код
│   └── public/           ← HTML сайт
│       ├── index.html
│       ├── about.html
│       └── admin/        ← React админка (после build)
│
├── admin-panel/          ← React source (для разработки)
│   └── src/
│
└── docker-compose.dev.yml ← Просто backend!
```

## ✏️ Редактирование

### Публичный Сайт

```bash
# Редактируйте в backend/public/
nano backend/public/index.html

# Изменения видны сразу (volume mount)
# Откройте http://localhost:3000
```

### React Админка

```bash
# 1. Редактируйте
nano admin-panel/src/App.tsx

# 2. Соберите
cd admin-panel && npm run build

# 3. Скопируйте в backend
cp -r dist/* ../backend/public/admin/
```

### Backend API

```bash
# Редактируйте
nano backend/src/routes/newsRoutes.ts

# Nodemon перезагрузит автоматически
```

## 🎯 Что Изменилось

### Было (v2.0):
```
❌ nginx reverse proxy
❌ frontend/ папка
❌ admin-panel container
❌ backend container
❌ Три сервиса, сложно!
```

### Стало (v3.0):
```
✅ Только backend!
✅ Один порт: 3000
✅ Все файлы в backend/public/
✅ Просто и понятно!
```

## 📚 Полная Документация

- [SIMPLIFIED_ARCHITECTURE.md](./SIMPLIFIED_ARCHITECTURE.md) - Полная архитектура
- [DEV_SETUP.md](./DEV_SETUP.md) - Детальное руководство (устарело)
- [COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md) - Production деплой

## 🐛 Частые Вопросы

### Q: Где редактировать HTML?
**A:** В `backend/public/index.html`

### Q: Где находится админка?
**A:** Source в `admin-panel/src/`, build в `backend/public/admin/`

### Q: Как обновить админку?
**A:**
```bash
cd admin-panel
npm run build
cp -r dist/* ../backend/public/admin/
```

### Q: Почему один порт?
**A:** Backend теперь отдает все: и сайт, и API, и админку!

### Q: А frontend/ папка?
**A:** Deprecated, не используется. Удалите её.

## ⚠️ Важно

**Редактировать HTML:**
- ✅ В `backend/public/`
- ❌ НЕ в `frontend/` (deprecated)
- ❌ НЕ в `admin-panel/public-site/`

**Один источник правды:**
- HTML: `backend/public/*.html`
- React: `admin-panel/src/*` → build → `backend/public/admin/`
- API: `backend/src/*`

---

**Версия:** 3.0 (Максимально упрощенная)
**Дата:** 2026-03-07
**Статус:** ✅ СУПЕР ПРОСТО!

**Главное изменение:** Backend теперь отдает ВСЕ! 🎉
