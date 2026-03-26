# 🏗 AURVA - Архитектура Проекта

## 📊 Схема Архитектуры

### Development Environment (docker-compose.dev.yml)

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│                    🌐 http://localhost:80                    │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │   Nginx Reverse Proxy │
                │   (Single Entry Point)│
                └───────────┬───────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
    ┌──────────────┐ ┌─────────────┐ ┌────────────┐
    │   Frontend   │ │ Admin Panel │ │  Backend   │
    │  (Static)    │ │   (React)   │ │ (Express)  │
    │              │ │             │ │            │
    │ /index.html  │ │   /admin    │ │   /api/*   │
    │ /about.html  │ │   Hot Reload│ │  REST API  │
    │ /news.html   │ │  (Vite HMR) │ │  Port 3000 │
    └──────────────┘ └─────────────┘ └────┬───────┘
                                           │
                                           ▼
                                   ┌───────────────┐
                                   │   Supabase    │
                                   │   PostgreSQL  │
                                   │   Storage     │
                                   └───────────────┘
```

### Production Environment (docker-compose.yml)

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│                   🌐 https://aurva.kg                        │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │      Traefik/Nginx    │
                │    (Load Balancer)    │
                └───────────┬───────────┘
                            │
            ┌───────────────┴───────────────┐
            │                               │
            ▼                               ▼
    ┌──────────────────┐          ┌────────────────┐
    │   Admin Panel    │          │    Backend     │
    │  Nginx Container │          │   Container    │
    │                  │          │                │
    │ • Public Site    │◄─────────┤  Express API   │
    │   (Static HTML)  │  Proxy   │  Port 3000     │
    │                  │  /api/   │                │
    │ • Admin Panel    │          │                │
    │   (React SPA)    │          │                │
    │   /admin/*       │          │                │
    └──────────────────┘          └────────┬───────┘
                                           │
                                           ▼
                                   ┌───────────────┐
                                   │   Supabase    │
                                   │   PostgreSQL  │
                                   │   Storage     │
                                   └───────────────┘
```

## 📁 Файловая Структура

```
aurva/
│
├── 📂 frontend/                    # ✅ Публичный сайт (Источник правды)
│   ├── index.html                  # Главная страница
│   ├── about.html                  # О нас
│   ├── news.html                   # Новости
│   ├── fontawesome/                # Иконки
│   ├── Dockerfile                  # Production build
│   └── nginx.conf                  # Nginx конфигурация
│
├── 📂 admin-panel/                 # ✅ React админка
│   ├── 📂 src/                     # React компоненты
│   │   ├── App.tsx                 # Главный компонент
│   │   ├── pages/                  # Страницы
│   │   ├── components/             # UI компоненты
│   │   └── utils/                  # Утилиты
│   ├── 📂 public-site/             # Копия frontend/ для деплоя
│   │   └── *.html                  # Синхронизируется из frontend/
│   ├── Dockerfile                  # Production build
│   ├── Dockerfile.dev              # Development с hot reload
│   ├── nginx.conf                  # Nginx для production
│   └── package.json
│
├── 📂 backend/                     # ✅ Express API
│   ├── 📂 src/
│   │   ├── app.ts                  # Express приложение
│   │   ├── server.ts               # HTTP сервер
│   │   ├── routes/                 # API роуты
│   │   ├── controllers/            # Логика контроллеров
│   │   ├── models/                 # Mongoose модели
│   │   ├── middleware/             # Middleware
│   │   └── utils/                  # Утилиты
│   ├── 📂 public/                  # Только для uploads
│   │   └── uploads/                # Загруженные файлы
│   ├── Dockerfile                  # Production build
│   └── package.json
│
├── 📂 nginx/                       # ✅ Reverse Proxy для dev
│   └── nginx.dev.conf              # Конфигурация для development
│
├── 📂 docs/                        # Документация
│
├── docker-compose.yml              # Production деплой
├── docker-compose.dev.yml          # Локальная разработка
├── sync-frontend.sh                # Скрипт синхронизации
│
├── .env                            # Переменные окружения (не в Git)
├── .env.example                    # Пример .env файла
├── .gitignore
│
├── README.md                       # Главный README
├── QUICK_START.md                  # Быстрый старт
├── DEV_SETUP.md                    # Полное руководство
└── ARCHITECTURE.md                 # Эта документация
```

## 🔄 Workflow

### 1. Разработка Frontend (Публичный Сайт)

```bash
# Редактирование
vim frontend/index.html

# Синхронизация для деплоя
./sync-frontend.sh

# Перезагрузка nginx
docker-compose -f docker-compose.dev.yml restart nginx
```

**Путь данных:**
```
frontend/*.html → nginx → Browser (localhost/)
```

### 2. Разработка Admin Panel

```bash
# Редактирование (auto hot reload)
vim admin-panel/src/App.tsx
```

**Путь данных:**
```
admin-panel/src/* → Vite HMR → nginx → Browser (localhost/admin)
                                ▲
                                │
                         WebSocket (Hot Reload)
```

### 3. Разработка Backend API

```bash
# Редактирование (auto nodemon reload)
vim backend/src/routes/newsRoutes.ts
```

**Путь данных:**
```
Client Request → nginx → backend:3000/api/* → Supabase
                  ▲                              │
                  └──────── Response ────────────┘
```

## 🌐 Роутинг

### Development (localhost)

| URL | Сервис | Описание |
|-----|--------|----------|
| `http://localhost/` | Frontend (Static) | Главная страница |
| `http://localhost/about.html` | Frontend (Static) | О нас |
| `http://localhost/news.html` | Frontend (Static) | Новости |
| `http://localhost/admin` | Admin Panel (React) | Админка |
| `http://localhost/admin/login` | Admin Panel (React) | Вход в админку |
| `http://localhost/api/news` | Backend (Express) | API новостей |
| `http://localhost/api/members` | Backend (Express) | API участников |

### Production (aurva.kg)

| URL | Сервис | Описание |
|-----|--------|----------|
| `https://aurva.kg/` | Nginx → Frontend | Главная страница |
| `https://aurva.kg/about.html` | Nginx → Frontend | О нас |
| `https://aurva.kg/admin` | Nginx → Admin Panel | Админка |
| `https://aurva.kg/api/*` | Nginx → Backend | API endpoints |

## 🔒 Безопасность

### Headers (Nginx)

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

### CORS (Backend)

```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
```

### Authentication

- JWT токены для API
- Supabase Auth для админки
- Защищенные роуты с middleware

## 📊 Данные

### Database Schema (Supabase PostgreSQL)

```sql
-- News
CREATE TABLE news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  content TEXT,
  imageUrl VARCHAR(500),
  published BOOLEAN,
  createdAt TIMESTAMP
);

-- Members
CREATE TABLE members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  logoUrl VARCHAR(500),
  website VARCHAR(500),
  isActive BOOLEAN
);

-- Contacts
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  createdAt TIMESTAMP
);
```

## 🚀 Deployment Flow

### Development → Production

```
1. Developer edits code
   ├── Frontend: frontend/*.html
   ├── Admin: admin-panel/src/*
   └── Backend: backend/src/*

2. Sync frontend files
   └── ./sync-frontend.sh

3. Git commit & push
   └── git push origin main

4. Coolify auto-deploy
   ├── Pull changes
   ├── Build Docker images
   ├── Run docker-compose up
   └── Update containers

5. Production live
   └── https://aurva.kg
```

## 📝 Best Practices

### ✅ DO
1. Редактируйте frontend ТОЛЬКО в `frontend/`
2. Используйте `docker-compose.dev.yml` для локальной разработки
3. Синхронизируйте frontend перед деплоем
4. Коммитьте изменения после тестирования

### ❌ DON'T
1. НЕ редактируйте HTML в других местах
2. НЕ коммитьте .env файлы
3. НЕ забывайте синхронизировать frontend
4. НЕ используйте production compose для dev

---

**Версия:** 2.0
**Дата:** 2026-03-07
**Статус:** ✅ Production Ready
