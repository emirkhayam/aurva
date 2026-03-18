# 🔄 Миграция на AURVA v3.0

## Что изменилось

**v2.0 → v3.0: Упрощение архитектуры**

### Было (v2.0):
- `nginx` - reverse proxy
- `frontend/` - статические HTML файлы
- `admin-panel` - React админка в отдельном контейнере
- `backend` - только API

### Стало (v3.0):
- ✅ `backend` - отдает ВСЕ (HTML + API + админка)
- ❌ `nginx` - больше не нужен для dev
- ❌ `frontend/` - deprecated, файлы перенесены в `backend/public/`

## 🚀 Как мигрировать

### Шаг 1: Обновить код

```bash
# Получить последнюю версию
git pull origin main
```

### Шаг 2: Проверить файлы

```bash
# HTML файлы должны быть в backend/public/
ls -la backend/public/
# Должны быть: index.html, about.html, news.html, fontawesome/

# Если их нет, скопируйте из frontend/
cp -r frontend/* backend/public/
```

### Шаг 3: Обновить .env (если нужно)

```bash
# .env остается без изменений
# Но проверьте что все переменные на месте
cat .env
```

### Шаг 4: Остановить старые контейнеры

```bash
# Остановить все старые контейнеры
docker-compose down

# Или для dev
docker-compose -f docker-compose.dev.yml down
```

### Шаг 5: Запустить новую версию

```bash
# Dev окружение
docker-compose -f docker-compose.dev.yml up --build

# Или production
docker-compose up --build -d
```

### Шаг 6: Проверить работу

```bash
# Должны работать:
curl http://localhost:3000/              # Главная страница (HTML)
curl http://localhost:3000/about.html    # О нас (HTML)
curl http://localhost:3000/api/health    # API health check
curl http://localhost:3000/admin         # Admin panel (HTML)
```

## 🔍 Проверка миграции

### ✅ Что должно работать:

1. **Публичный сайт** на `http://localhost:3000/`
   - Должен показывать HTML, а не JSON
   - Все стили должны загружаться
   - Иконки FontAwesome должны работать

2. **API** на `http://localhost:3000/api/*`
   - `/api/health` - health check
   - `/api/news` - список новостей
   - `/api/members` - список участников

3. **Админ панель** на `http://localhost:3000/admin`
   - Должна загружаться React приложение
   - Роутинг должен работать

### ❌ Типичные проблемы:

#### Проблема: Главная страница показывает JSON

**Причина:** Старый код app.ts с `app.get('/', ...)`

**Решение:**
```bash
# Обновите backend/src/app.ts
# Убедитесь что нет app.get('/', ...) который отдает JSON
# Статика должна отдаваться через express.static()
```

#### Проблема: HTML файлы не найдены

**Причина:** Файлы не скопированы в backend/public/

**Решение:**
```bash
# Скопируйте из frontend/
cp -r frontend/* backend/public/

# Или из admin-panel/public-site/
cp -r admin-panel/public-site/* backend/public/
```

#### Проблема: CSS/JS не загружаются

**Причина:** Неправильные пути в HTML

**Решение:**
```bash
# Проверьте пути в index.html
# Должны быть относительные пути:
# <link href="/fontawesome/css/all.min.css">
# НЕ <link href="fontawesome/css/all.min.css">
```

## 📁 Структура после миграции

```
aurva/
├── backend/
│   ├── src/              ✅ API код
│   └── public/           ✅ Все статические файлы
│       ├── index.html
│       ├── about.html
│       ├── news.html
│       ├── fontawesome/
│       └── admin/        ← React админка (после build)
│
├── admin-panel/
│   ├── src/              ✅ React source (для разработки)
│   └── public-site/      ⚠️ Копия для production nginx
│
├── frontend/             ❌ DEPRECATED - можно удалить
│
├── nginx/                ❌ Не нужен для dev
│
├── docker-compose.dev.yml ✅ Только backend
└── docker-compose.yml     ✅ Backend + admin-panel nginx
```

## 🗑 Очистка (опционально)

После успешной миграции можете удалить:

```bash
# 1. Старые контейнеры и образы
docker system prune -a

# 2. Deprecated папку frontend/
# ВНИМАНИЕ: Убедитесь что файлы скопированы в backend/public/!
rm -rf frontend/

# 3. Nginx конфиг для dev (больше не используется)
rm -rf nginx/
```

## 🎉 Готово!

После миграции вы должны видеть:

```bash
# Запуск
docker-compose -f docker-compose.dev.yml up

# Логи
✅ Backend started on port 3000
✅ Serving static files from /app/public
✅ API routes mounted at /api
✅ Admin panel available at /admin

# Доступ
🌐 http://localhost:3000/       - Публичный сайт
🔐 http://localhost:3000/admin  - Админ панель
🔌 http://localhost:3000/api    - REST API
```

## 📞 Помощь

Если что-то не работает:

1. Проверьте [QUICK_START_V3.md](./QUICK_START_V3.md)
2. Посмотрите [SIMPLIFIED_ARCHITECTURE.md](./SIMPLIFIED_ARCHITECTURE.md)
3. Проверьте логи: `docker-compose logs backend`

---

**Версия миграции:** v2.0 → v3.0
**Дата:** 2026-03-07
**Статус:** ✅ Упрощено
