# 🚀 AURVA - Quick Start

## ⚡ За 3 Минуты

### 1️⃣ Установка

```bash
# Клонировать репозиторий
git clone <repo-url>
cd aurva

# Создать .env файл
cp .env.production.example .env

# Заполнить переменные окружения
nano .env
```

### 2️⃣ Локальная Разработка (Один localhost)

```bash
# Запустить все сервисы на http://localhost
docker-compose -f docker-compose.dev.yml up --build
```

**Доступ:**
- 🌐 Публичный сайт: http://localhost
- 🔐 Админка: http://localhost/admin
- 🔌 API: http://localhost/api

### 3️⃣ Production Деплой

```bash
# На сервере (Coolify автоматически использует этот файл)
docker-compose up --build -d
```

## 📁 Структура Проекта

```
aurva/
├── frontend/              ← Редактируйте HTML здесь
├── admin-panel/           ← React админка
├── backend/               ← Express API
├── nginx/                 ← Reverse proxy для dev
├── docker-compose.dev.yml ← Локальная разработка
└── docker-compose.yml     ← Production деплой
```

## ✏️ Редактирование

### Frontend (Публичный Сайт)
```bash
# 1. Редактируйте файлы
nano frontend/index.html

# 2. Синхронизируйте для деплоя
./sync-frontend.sh

# 3. Перезагрузите nginx
docker-compose -f docker-compose.dev.yml restart nginx
```

### Admin Panel (React)
```bash
# Просто редактируйте - hot reload работает автоматически
nano admin-panel/src/App.tsx
```

### Backend (API)
```bash
# Просто редактируйте - nodemon перезагрузит автоматически
nano backend/src/routes/newsRoutes.ts
```

## 🐛 Проблемы?

### "Сайт показывает HTML код"
✅ **Исправлено!** Nginx конфигурация обновлена

### "Разные версии сайта"
✅ **Исправлено!** Дублированные файлы удалены

### "Разные localhost порты"
✅ **Исправлено!** Теперь все на http://localhost

## 📚 Полная Документация

Для детальной информации смотрите:
- [DEV_SETUP.md](./DEV_SETUP.md) - Полное руководство по разработке
- [COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md) - Деплой на production

---

**Версия:** 2.0 (После рефакторинга)
**Дата:** 2026-03-07
