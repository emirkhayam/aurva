# Инструкция по деплою Aurva

## Предварительные требования

### 1. Установите cloudflared

**Windows:**
1. Скачайте: https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe
2. Переименуйте в `cloudflared.exe`
3. Поместите в `C:\Windows\System32\` или добавьте путь в PATH

**Проверка установки:**
```bash
cloudflared --version
```

### 2. SSH конфиг уже настроен
Файл `~/.ssh/config` содержит настройки для подключения к серверу aurva.kg

## Подключение к серверу

### Первое подключение:
```bash
ssh ssh.aurva.kg
```

При первом подключении:
1. Откроется браузер с Cloudflare Access
2. Войдите: `emilbekovemir85@gmail.com` / `AurvaDev2026!`
3. После авторизации вернитесь в терминал
4. Введите пароль SSH: `AurvaSSH2026!`

### Получить root:
```bash
sudo su
```

## Деплой приложения

### Вариант 1: Через готовые Docker образы (рекомендуется)

**На вашем компьютере:**
```bash
# Загрузить образы на сервер
scp aurva-backend.tar.gz aurva-admin-panel.tar.gz ssh.aurva.kg:/tmp/
```

**На сервере:**
```bash
ssh ssh.aurva.kg

# Загрузить образы в Docker
sudo gunzip < /tmp/backend.tar.gz | sudo docker load
sudo gunzip < /tmp/admin-panel.tar.gz | sudo docker load

# Перейти в директорию проекта
cd /opt/aurva

# Запустить контейнеры
sudo docker compose up -d

# Проверить статус
sudo docker ps
curl -I https://aurva.kg
```

### Вариант 2: Через Git и сборку на сервере

**ВНИМАНИЕ:** Требуется решение проблемы с DNS (см. ИТОГОВЫЙ_ОТЧЕТ.md)

```bash
# Подключиться к серверу
ssh ssh.aurva.kg

# Обновить код
cd /opt/aurva
sudo git pull origin main

# Пересобрать и запустить
sudo docker compose build
sudo docker compose up -d

# Проверить логи
sudo docker logs aurva-backend-1 -f
sudo docker logs aurva-admin-panel-1 -f
```

### Вариант 3: Через Coolify (автоматический деплой)

1. Откройте: https://c.aurva.kg
2. Войдите: `emilbekovemir85@gmail.com` / `AurvaCool2026!`
3. Найдите приложение AURVA
4. Нажмите "Redeploy"

## Проверка работоспособности

```bash
# Проверить контейнеры
ssh ssh.aurva.kg "sudo docker ps"

# Проверить логи backend
ssh ssh.aurva.kg "sudo docker logs aurva-backend-1 --tail 50"

# Проверить логи admin-panel
ssh ssh.aurva.kg "sudo docker logs aurva-admin-panel-1 --tail 50"

# Проверить сайт
curl https://aurva.kg
```

## Полезные команды

### Мониторинг
```bash
# Все контейнеры
ssh ssh.aurva.kg "sudo docker ps -a"

# Использование ресурсов
ssh ssh.aurva.kg "sudo docker stats --no-stream"

# Логи с фильтрацией
ssh ssh.aurva.kg "sudo docker logs aurva-backend-1 2>&1 | grep ERROR"
```

### Управление контейнерами
```bash
# Перезапустить
ssh ssh.aurva.kg "cd /opt/aurva && sudo docker compose restart"

# Остановить
ssh ssh.aurva.kg "cd /opt/aurva && sudo docker compose down"

# Пересобрать
ssh ssh.aurva.kg "cd /opt/aurva && sudo docker compose up -d --build"
```

### База данных (Supabase)
```bash
# Проверить статус Supabase
ssh ssh.aurva.kg "sudo docker ps | grep supabase"

# Подключиться к PostgreSQL
ssh ssh.aurva.kg "sudo docker exec -it supabase-db psql -U postgres"
```

## Панели управления

| Панель | URL | Логин | Пароль |
|--------|-----|-------|--------|
| **Coolify** (деплой) | https://c.aurva.kg | `emilbekovemir85@gmail.com` | `AurvaCool2026!` |
| **Proxmox** (VM) | https://p.aurva.kg | через Keycloak | `AurvaDev2026!` |
| **Admin Panel** | https://aurva.kg/admin | (создайте через Supabase) | - |

## Проблемы и решения

| Проблема | Решение |
|----------|---------|
| `cloudflared: command not found` | Установите cloudflared (см. выше) |
| Браузер не открывается | Скопируйте URL из терминала вручную |
| `Permission denied` | Пароль SSH: `AurvaSSH2026!` |
| `Connection refused` | Сервер перезагружается, подождите 2 минуты |
| DNS timeout при сборке | Используйте готовые образы (Вариант 1) |

## Структура проекта на сервере

```
/opt/aurva/
├── backend/              # Backend API (Node.js + Express)
├── admin-panel/          # Frontend Admin Panel (React + Vite)
├── docker-compose.yml    # Конфигурация Docker Compose
├── .env                  # Переменные окружения
└── nginx/                # Nginx конфигурация (если используется)
```

## Переменные окружения (.env)

Основные переменные уже настроены на сервере в `/opt/aurva/.env`:
- `SUPABASE_URL` - URL Supabase
- `SUPABASE_ANON_KEY` - Публичный ключ Supabase
- `SUPABASE_SERVICE_KEY` - Серверный ключ Supabase
- `DATABASE_*` - Параметры подключения к PostgreSQL
- `JWT_SECRET` - Секрет для JWT токенов

**ВАЖНО:** Не коммитьте файл `.env` в Git!

---

**Дата создания:** 24 марта 2026
**Автор:** Claude Code Assistant
