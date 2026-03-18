# 🎯 AURVA - Упрощенная Архитектура

## ✨ Новая Простая Структура

**Backend теперь отдает ВСЕ:**
- ✅ Публичный сайт (HTML файлы)
- ✅ REST API
- ✅ React админка (после билда)
- ✅ Загруженные файлы

## 📊 Схема

### Development (Локальная Разработка)

```
┌─────────────────────────────────────────┐
│                                         │
│      🌐 http://localhost:3000          │
│                                         │
└───────────────┬─────────────────────────┘
                │
                ▼
        ┌───────────────┐
        │    Backend    │
        │   (Express)   │
        │   Port 3000   │
        └───────┬───────┘
                │
    ┌───────────┼───────────┐
    │           │           │
    ▼           ▼           ▼
┌────────┐  ┌──────┐  ┌──────────┐
│ Public │  │ API  │  │  Admin   │
│  Site  │  │      │  │  Panel   │
│   /    │  │ /api │  │  /admin  │
└────────┘  └──────┘  └──────────┘
                │
                ▼
        ┌──────────────┐
        │   Supabase   │
        │  PostgreSQL  │
        └──────────────┘
```

### Production

```
┌──────────────────────────────────────────┐
│                                          │
│       🌐 https://aurva.kg               │
│                                          │
└────────────────┬─────────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │ Admin Panel   │
         │  (Nginx)      │
         │  Port 80      │
         └───────┬───────┘
                 │
     ┌───────────┼───────────┐
     │                       │
     ▼                       ▼
┌──────────┐          ┌────────────┐
│ Public   │          │  Backend   │
│  HTML    │          │ (Proxied)  │
│  Files   │          │   /api     │
└──────────┘          └─────┬──────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   Supabase   │
                    │  PostgreSQL  │
                    └──────────────┘
```

## 📁 Структура Проекта

```
aurva/
│
├── 📂 backend/                    # ✅ Главный сервис
│   ├── 📂 src/
│   │   ├── app.ts                 # Express приложение
│   │   ├── routes/                # API роуты
│   │   └── ...
│   ├── 📂 public/                 # ✅ Публичный сайт здесь!
│   │   ├── index.html             # Главная
│   │   ├── about.html             # О нас
│   │   ├── news.html              # Новости
│   │   ├── fontawesome/           # Иконки
│   │   └── admin/                 # React админка (после build)
│   │       └── index.html
│   └── Dockerfile
│
├── 📂 admin-panel/                # React админка (source)
│   ├── src/
│   ├── public-site/               # Копия для production nginx
│   └── Dockerfile
│
├── 📂 frontend/                   # DEPRECATED (не используется)
│
├── docker-compose.dev.yml         # Dev: только backend
└── docker-compose.yml             # Prod: backend + admin-panel
```

## 🎯 Как это работает

### Backend отдает файлы:

```typescript
// backend/src/app.ts

// Статические файлы публичного сайта
app.use(express.static(path.join(__dirname, '../public')));
// Теперь:
// / → public/index.html
// /about.html → public/about.html
// /news.html → public/news.html

// React админка
app.use('/admin', express.static(path.join(__dirname, '../public/admin')));
// /admin → public/admin/index.html

// API роуты
app.use('/api/news', newsRoutes);
// /api/news → REST API
```

## 🚀 Использование

### Development (Локальная Разработка)

```bash
# 1. Создать .env
cp .env.example .env

# 2. Запустить backend
docker-compose -f docker-compose.dev.yml up --build

# 3. Открыть браузер
# 🌐 Публичный сайт:  http://localhost:3000
# 🔐 Админка:         http://localhost:3000/admin
# 🔌 API:             http://localhost:3000/api
```

**Доступные URL:**
- `http://localhost:3000/` - Главная страница
- `http://localhost:3000/about.html` - О нас
- `http://localhost:3000/news.html` - Новости
- `http://localhost:3000/admin` - Админ панель
- `http://localhost:3000/api/news` - API новостей
- `http://localhost:3000/health` - Health check

### Production

```bash
# На сервере (Coolify автоматически)
docker-compose up --build -d
```

## ✏️ Редактирование

### Публичный Сайт (HTML)

```bash
# 1. Редактируйте файлы в backend/public/
nano backend/public/index.html

# 2. Для dev - файлы обновятся автоматически (volume mount)
# Для production - пересоберите контейнер
docker-compose up --build
```

### React Админка

```bash
# 1. Редактируйте в admin-panel/src/
nano admin-panel/src/App.tsx

# 2. Соберите
cd admin-panel && npm run build

# 3. Скопируйте в backend
cp -r dist/* ../backend/public/admin/
```

### Backend API

```bash
# Редактируйте backend/src/
nano backend/src/routes/newsRoutes.ts
# Nodemon автоматически перезагрузит
```

## 🔄 Workflow

### До (Сложно):
```
❌ frontend/ → nginx → Browser
❌ admin-panel/ → nginx → Browser
❌ backend → nginx → Browser
❌ Три сервиса, nginx reverse proxy
```

### Сейчас (Просто):
```
✅ backend/public/ → Express → Browser
✅ backend/src/ → Express API
✅ Один сервис, все в одном месте!
```

## 📝 Преимущества

### ✅ Упрощение:
1. **Меньше контейнеров** - только backend для dev
2. **Нет nginx** для локальной разработки
3. **Один порт** - `localhost:3000`
4. **Проще деплой** - меньше конфигурации

### ✅ Быстрее:
1. Нет лишних proxy слоев
2. Прямой доступ к файлам
3. Меньше сетевых запросов

### ✅ Понятнее:
1. Все файлы в `backend/public/`
2. Один источник правды
3. Проще отлаживать

## ⚠️ Правила

### ✅ ДЕЛАТЬ:
- Редактировать HTML в `backend/public/`
- Использовать `localhost:3000` для всего
- Коммитить изменения после тестирования

### ❌ НЕ ДЕЛАТЬ:
- НЕ создавать файлы в `frontend/` (deprecated)
- НЕ забывать пересобирать админку
- НЕ коммитить .env файлы

## 🎉 Итог

**Было:**
```
nginx (reverse proxy)
  ├─ frontend (static HTML)
  ├─ admin-panel (React)
  └─ backend (API)
```

**Стало:**
```
backend (Express)
  ├─ public/ (static HTML + React build)
  └─ src/ (API)
```

**Результат:**
- ✅ Проще
- ✅ Быстрее
- ✅ Понятнее
- ✅ Меньше кода

---

**Версия:** 3.0 (Упрощенная архитектура)
**Дата:** 2026-03-07
**Статус:** ✅ ГОТОВО
