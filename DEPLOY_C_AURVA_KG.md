# 🚀 Развертывание AURVA на c.aurva.kg

Полное руководство по развертыванию проекта AURVA на сервере с доменом `https://c.aurva.kg/`

## 📋 Оглавление

1. [Предварительные требования](#предварительные-требования)
2. [Подготовка сервера](#подготовка-сервера)
3. [Установка Docker](#установка-docker)
4. [Развертывание проекта](#развертывание-проекта)
5. [Настройка SSL/HTTPS](#настройка-sslhttps)
6. [Проверка работы](#проверка-работы)
7. [Troubleshooting](#troubleshooting)

---

## 📦 Предварительные требования

### На сервере должно быть установлено:
- Ubuntu 20.04+ (или другой Linux дистрибутив)
- Docker 20.10+
- Docker Compose 2.0+
- Git
- Минимум 2GB RAM
- Минимум 20GB свободного места на диске

### Необходимые данные:
- ✅ Доступ к серверу по SSH
- ✅ Домен `c.aurva.kg` настроен и указывает на IP сервера
- ✅ API ключи Supabase (уже есть в `.env.production`)
- ✅ Email для отправки уведомлений

---

## 🖥️ Подготовка сервера

### 1. Подключение к серверу

```bash
ssh user@c.aurva.kg
# или
ssh user@<IP-адрес-сервера>
```

### 2. Обновление системы

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Установка необходимых пакетов

```bash
sudo apt install -y git curl wget nano ufw
```

### 4. Настройка файрвола

```bash
# Разрешить SSH
sudo ufw allow 22/tcp

# Разрешить HTTP и HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Включить файрвол
sudo ufw --force enable

# Проверить статус
sudo ufw status
```

---

## 🐳 Установка Docker

### 1. Установка Docker Engine

```bash
# Удаление старых версий
sudo apt remove docker docker-engine docker.io containerd runc

# Установка зависимостей
sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Добавление GPG ключа Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Добавление репозитория Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установка Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Проверка установки
docker --version
```

### 2. Настройка прав для Docker

```bash
# Добавление пользователя в группу docker
sudo usermod -aG docker $USER

# Применение изменений (или перелогиньтесь)
newgrp docker

# Проверка
docker ps
```

---

## 🚀 Развертывание проекта

### 1. Клонирование репозитория

```bash
# Переход в домашнюю директорию
cd ~

# Клонирование проекта
git clone <URL-вашего-репозитория> aurva
cd aurva

# Или если репозиторий уже склонирован, обновите его
git pull origin main
```

### 2. Настройка переменных окружения

```bash
# Копирование файла с переменными окружения
cp .env.production .env

# Редактирование .env файла
nano .env
```

**ВАЖНО! Обязательно измените следующие значения:**

```bash
# JWT секреты - сгенерируйте случайные строки
JWT_SECRET=ваш-случайный-секретный-ключ-минимум-32-символа
AUTH_JWT_SECRET=другой-случайный-секретный-ключ-минимум-32-символа

# Пароль администратора
ADMIN_PASSWORD=ваш-надежный-пароль

# Email настройки
EMAIL_USER=ваш-email@gmail.com
EMAIL_PASSWORD=ваш-app-password-от-gmail
```

**Генерация случайных секретов:**

```bash
# Генерация JWT_SECRET
openssl rand -base64 32

# Генерация AUTH_JWT_SECRET
openssl rand -base64 32
```

### 3. Запуск проекта

```bash
# Сборка и запуск контейнеров
docker compose -f docker-compose.production.yml up -d --build

# Просмотр логов
docker compose -f docker-compose.production.yml logs -f

# Проверка статуса контейнеров
docker compose -f docker-compose.production.yml ps
```

### 4. Проверка здоровья сервисов

```bash
# Проверка backend
curl http://localhost:3000/health

# Проверка admin-panel
curl http://localhost:80/health

# Проверка API
curl http://localhost:80/api/health
```

---

## 🔒 Настройка SSL/HTTPS

### Вариант 1: Использование Let's Encrypt с Certbot

```bash
# Установка Certbot
sudo apt install -y certbot

# Остановка nginx в контейнере (временно)
docker compose -f docker-compose.production.yml stop admin-panel

# Получение сертификата
sudo certbot certonly --standalone -d c.aurva.kg -d www.c.aurva.kg

# Запуск nginx обратно
docker compose -f docker-compose.production.yml start admin-panel
```

### Вариант 2: Использование Nginx Proxy Manager

Если на сервере уже установлен Nginx или другой reverse proxy:

**Конфигурация Nginx:**

```nginx
server {
    listen 80;
    server_name c.aurva.kg www.c.aurva.kg;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name c.aurva.kg www.c.aurva.kg;

    ssl_certificate /etc/letsencrypt/live/c.aurva.kg/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/c.aurva.kg/privkey.pem;

    # SSL конфигурация
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Проксирование к Docker контейнеру
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Вариант 3: Использование Traefik (рекомендуется)

Создайте файл `docker-compose.traefik.yml`:

```yaml
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    container_name: traefik
    restart: unless-stopped
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@aurva.kg"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik-certificates:/letsencrypt
    networks:
      - aurva-network

volumes:
  traefik-certificates:

networks:
  aurva-network:
    external: true
```

Затем обновите `docker-compose.production.yml`, добавив labels для Traefik:

```yaml
admin-panel:
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.aurva.rule=Host(`c.aurva.kg`) || Host(`www.c.aurva.kg`)"
    - "traefik.http.routers.aurva.entrypoints=websecure"
    - "traefik.http.routers.aurva.tls=true"
    - "traefik.http.routers.aurva.tls.certresolver=letsencrypt"
    - "traefik.http.services.aurva.loadbalancer.server.port=80"
```

---

## ✅ Проверка работы

### 1. Проверка доступности сайта

```bash
# Проверка HTTP
curl -I http://c.aurva.kg

# Проверка HTTPS
curl -I https://c.aurva.kg

# Проверка API
curl https://c.aurva.kg/api/health
```

### 2. Проверка в браузере

Откройте в браузере:
- https://c.aurva.kg - главная страница
- https://c.aurva.kg/admin - админ панель
- https://c.aurva.kg/api/health - проверка API

### 3. Вход в админ панель

1. Перейдите на https://c.aurva.kg/admin
2. Используйте учетные данные из `.env`:
   - Email: значение из `ADMIN_EMAIL`
   - Пароль: значение из `ADMIN_PASSWORD`

### 4. Проверка логов

```bash
# Все логи
docker compose -f docker-compose.production.yml logs -f

# Только backend
docker compose -f docker-compose.production.yml logs -f backend

# Только admin-panel
docker compose -f docker-compose.production.yml logs -f admin-panel

# Последние 100 строк
docker compose -f docker-compose.production.yml logs --tail=100 backend
```

---

## 🔧 Управление проектом

### Основные команды

```bash
# Остановка всех контейнеров
docker compose -f docker-compose.production.yml down

# Запуск контейнеров
docker compose -f docker-compose.production.yml up -d

# Перезапуск контейнеров
docker compose -f docker-compose.production.yml restart

# Пересборка и запуск (после изменений в коде)
docker compose -f docker-compose.production.yml up -d --build

# Просмотр статуса
docker compose -f docker-compose.production.yml ps

# Удаление всех контейнеров и volumes
docker compose -f docker-compose.production.yml down -v
```

### Обновление проекта

```bash
# Переход в директорию проекта
cd ~/aurva

# Получение последних изменений
git pull origin main

# Пересборка и перезапуск
docker compose -f docker-compose.production.yml up -d --build
```

### Резервное копирование

```bash
# Создание директории для бэкапов
mkdir -p ~/backups

# Бэкап volumes
docker run --rm \
  -v aurva-main_backend-uploads:/data/uploads \
  -v aurva-main_backend-data:/data/data \
  -v ~/backups:/backup \
  ubuntu tar czf /backup/aurva-backup-$(date +%Y%m%d-%H%M%S).tar.gz -C /data .

# Бэкап .env файла
cp .env ~/backups/.env.$(date +%Y%m%d-%H%M%S)
```

---

## 🐛 Troubleshooting

### Проблема: Контейнеры не запускаются

```bash
# Проверка логов
docker compose -f docker-compose.production.yml logs

# Проверка статуса
docker compose -f docker-compose.production.yml ps

# Пересоздание контейнеров
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d --force-recreate
```

### Проблема: Сайт не доступен

1. Проверьте DNS:
```bash
nslookup c.aurva.kg
```

2. Проверьте файрвол:
```bash
sudo ufw status
```

3. Проверьте порты:
```bash
sudo netstat -tulpn | grep -E '80|443'
```

### Проблема: Ошибки базы данных

```bash
# Проверьте подключение к Supabase
docker compose -f docker-compose.production.yml exec backend node -e "
const { createClient } = require('@supabase/supabase-js');
const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
client.from('news').select('*').limit(1).then(console.log);
"
```

### Проблема: Нет свободного места

```bash
# Проверка места на диске
df -h

# Удаление неиспользуемых Docker образов
docker system prune -a

# Удаление старых логов
docker compose -f docker-compose.production.yml logs --tail=0 backend
```

### Проблема: Медленная работа

```bash
# Проверка использования ресурсов
docker stats

# Увеличение ресурсов для Docker (если нужно)
# Отредактируйте /etc/docker/daemon.json
```

---

## 📊 Мониторинг

### Проверка состояния сервера

```bash
# CPU и память
top

# Диск
df -h

# Docker статистика
docker stats

# Логи системы
journalctl -u docker -n 100 --no-pager
```

### Настройка автозапуска

Docker Compose уже настроен с `restart: unless-stopped`, но убедитесь что Docker запускается при загрузке:

```bash
sudo systemctl enable docker
sudo systemctl status docker
```

---

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи: `docker compose -f docker-compose.production.yml logs`
2. Проверьте этот документ в разделе Troubleshooting
3. Свяжитесь с технической поддержкой: aurva.kg@gmail.com

---

## 🎉 Готово!

Ваш проект AURVA успешно развернут на https://c.aurva.kg/

**Следующие шаги:**
- ✅ Измените пароли по умолчанию
- ✅ Настройте регулярные бэкапы
- ✅ Настройте мониторинг (опционально)
- ✅ Добавьте контент через админ панель

**Полезные ссылки:**
- Админ панель: https://c.aurva.kg/admin
- API документация: см. `backend/README.md`
- Основной сайт: https://c.aurva.kg

---

**Создано с ❤️ для AURVA**
