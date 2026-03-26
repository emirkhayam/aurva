# AURVA v3.0 - Упрощенная Архитектура

## 🚀 Быстрый старт

```bash
# 1. Настроить окружение
cp .env.example .env

# 2. Запустить
docker-compose -f docker-compose.dev.yml up --build

# 3. Открыть
open http://localhost:3000
```

## 📁 Структура

```
aurva/
└── backend/              ← Все в одном месте!
    ├── src/              # API
    └── public/           # HTML + админка
        ├── index.html
        ├── about.html
        └── admin/
```

## 🌐 URL

- Публичный сайт: `http://localhost:3000`
- Админ панель: `http://localhost:3000/admin`
- REST API: `http://localhost:3000/api`

## 📝 Редактирование

### HTML:
```bash
nano backend/public/index.html
```

### React админка:
```bash
cd admin-panel && npm run build
cp -r dist/* ../backend/public/admin/
```

### Backend API:
```bash
nano backend/src/routes/newsRoutes.ts
```

## 📚 Документация

- [START_HERE_V3.txt](./START_HERE_V3.txt) - Начните отсюда
- [QUICK_START_V3.md](./QUICK_START_V3.md) - Быстрый старт
- [SIMPLIFIED_ARCHITECTURE.md](./SIMPLIFIED_ARCHITECTURE.md) - Архитектура
- [MIGRATION_TO_V3.md](./MIGRATION_TO_V3.md) - Миграция
- [УПРОЩЕНИЕ_ЗАВЕРШЕНО.md](./УПРОЩЕНИЕ_ЗАВЕРШЕНО.md) - Что изменилось

## ✅ Что нового в v3.0

- ✅ Backend отдает все (HTML + API + админка)
- ✅ Один контейнер для dev
- ✅ Один порт: 3000
- ✅ Максимально просто!

---

**Версия:** 3.0 | **Статус:** Production Ready
