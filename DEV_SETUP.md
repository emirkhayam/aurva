# AURVA Development Setup Guide

## 🎯 Правильная Архитектура Проекта

После рефакторинга, проект имеет следующую структуру:

```
aurva/
├── frontend/              # ✅ Публичный сайт (источник правды)
│   ├── index.html
│   ├── about.html
│   ├── news.html
│   └── fontawesome/
│
├── admin-panel/           # ✅ React админка
│   ├── src/              # React компоненты
│   ├── public-site/      # Копия frontend/ для деплоя
│   ├── Dockerfile        # Production build
│   └── Dockerfile.dev    # Development с hot reload
│
├── backend/               # ✅ Express API
│   ├── src/
│   └── public/           # Только для uploads
│
├── nginx/                 # ✅ Reverse proxy для dev
│   └── nginx.dev.conf
│
├── docker-compose.yml     # Production деплой
└── docker-compose.dev.yml # Локальная разработка
```

## 🚀 Быстрый Старт

### Локальная Разработка (Один Localhost)

```bash
# 1. Создать .env файл (скопировать из .env.production.example)
cp .env.production.example .env

# 2. Заполнить переменные окружения
# Отредактировать .env файл

# 3. Запустить dev окружение
docker-compose -f docker-compose.dev.yml up --build

# 4. Открыть браузер
# 🌐 Публичный сайт:  http://localhost
# 🔐 Админ панель:     http://localhost/admin
# 🔌 Backend API:      http://localhost/api
```

### Production Деплой (Coolify/VPS)

```bash
# Использовать стандартный docker-compose
docker-compose up --build -d
```

## 📁 Источники Правды (Single Source of Truth)

### Frontend (Публичный Сайт)
- **Основная папка:** `frontend/`
- **Для деплоя:** Автоматически копируется в `admin-panel/public-site/`
- **Правило:** Всегда редактируйте файлы в `frontend/`, НЕ в других местах!

### Admin Panel
- **Основная папка:** `admin-panel/src/`
- **Dev сервер:** Vite с hot reload на порту 5173
- **Production:** Build создается в `admin-panel/dist/`

### Backend API
- **Основная папка:** `backend/src/`
- **Dev режим:** `npm run dev` с nodemon
- **Production:** `npm start`

## 🛠 Разработка

### Редактирование Frontend (Публичный Сайт)

```bash
# 1. Редактируйте файлы в frontend/
nano frontend/index.html

# 2. Синхронизируйте с admin-panel/public-site/ для деплоя
cp -r frontend/* admin-panel/public-site/

# 3. Перезагрузите nginx в Docker
docker-compose -f docker-compose.dev.yml restart nginx
```

### Редактирование Admin Panel

```bash
# 1. Файлы автоматически hot reload при изменении
# Просто редактируйте admin-panel/src/*

# 2. Смотрите изменения в реальном времени
# http://localhost/admin
```

### Редактирование Backend

```bash
# 1. Файлы автоматически перезагружаются (nodemon)
# Просто редактируйте backend/src/*

# 2. Проверяйте API
# http://localhost/api/health
```

## 🌐 Порты и URLs

### Development (docker-compose.dev.yml)
| Сервис | URL | Порт | Описание |
|--------|-----|------|----------|
| **Nginx Proxy** | http://localhost | 80 | Единая точка входа |
| Frontend | http://localhost/ | - | Публичный сайт |
| Admin Panel | http://localhost/admin | - | React админка |
| Backend API | http://localhost/api | - | REST API |
| Backend (direct) | http://localhost:3000 | 3000 | Прямой доступ к API |
| Admin Dev (direct) | http://localhost:5173 | 5173 | Vite dev server |

### Production (docker-compose.yml)
| Сервис | URL | Порт | Описание |
|--------|-----|------|----------|
| **Admin Panel** | https://aurva.kg | 80 | Nginx с публичным сайтом и админкой |
| Backend API | /api | 3000 | Внутренний порт, проксируется через admin-panel |

## 🐛 Решение Проблем

### "На моем сайте показывает HTML код"
**Причина:** Неправильный Content-Type заголовок
**Решение:** Nginx конфигурация уже исправлена в `nginx/nginx.dev.conf` и `admin-panel/nginx.conf`

### "Разные версии сайта в разных местах"
**Причина:** Файлы дублировались в 4 местах
**Решение:**
- ✅ Удалены дублированные файлы из корня проекта
- ✅ Удалены старые файлы из `backend/public/`
- ✅ `frontend/` - единственный источник правды
- ✅ `admin-panel/public-site/` - синхронизируется с `frontend/`

### "Не работает hot reload"
**Проверьте:**
1. Docker volumes правильно настроены
2. Порты не заняты другими приложениями
3. `.env` файл настроен корректно

### "502 Bad Gateway"
**Проверьте:**
1. Все сервисы запущены: `docker-compose -f docker-compose.dev.yml ps`
2. Backend healthcheck проходит: `curl http://localhost:3000/health`
3. Логи nginx: `docker-compose -f docker-compose.dev.yml logs nginx`

## 📝 Правила Разработки

### ✅ DO (Делать)
1. Редактируйте frontend файлы ТОЛЬКО в `frontend/`
2. Используйте `docker-compose.dev.yml` для локальной разработки
3. Коммитьте изменения после тестирования
4. Синхронизируйте `frontend/` → `admin-panel/public-site/` перед деплоем

### ❌ DON'T (Не делать)
1. НЕ редактируйте HTML файлы в `backend/public/`
2. НЕ создавайте дублирующиеся файлы в корне проекта
3. НЕ коммитьте `.env` файлы с секретами
4. НЕ забывайте обновлять `admin-panel/public-site/` перед деплоем

## 🔄 Workflow

### Разработка Новой Функции

```bash
# 1. Создать ветку
git checkout -b feature/new-feature

# 2. Запустить dev окружение
docker-compose -f docker-compose.dev.yml up

# 3. Разработка
# - Frontend: редактируйте frontend/*.html
# - Admin: редактируйте admin-panel/src/*
# - Backend: редактируйте backend/src/*

# 4. Тестирование
# Проверьте все на http://localhost

# 5. Синхронизация frontend для деплоя
cp -r frontend/* admin-panel/public-site/

# 6. Коммит
git add .
git commit -m "feat: add new feature"

# 7. Деплой (автоматически через Coolify)
git push origin feature/new-feature
```

## 🎨 API Endpoints

### Public API
- `GET /api/news` - Получить новости
- `GET /api/members` - Получить участников
- `POST /api/contacts` - Отправить заявку

### Admin API (требует авторизации)
- `POST /api/auth/login` - Вход в админку
- `POST /api/news` - Создать новость
- `PUT /api/news/:id` - Обновить новость
- `DELETE /api/news/:id` - Удалить новость

## 📚 Дополнительная Документация

- [Coolify Deployment](./COOLIFY_DEPLOYMENT.md)
- [Admin Panel Guide](./ADMIN_PANEL_GUIDE.md)
- [Backend API Documentation](./backend/README.md)

---

**Последнее обновление:** 2026-03-07
**Версия:** 2.0 (После рефакторинга структуры проекта)
