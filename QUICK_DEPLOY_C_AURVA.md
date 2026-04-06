# ⚡ Быстрое развертывание на c.aurva.kg

Упрощенное руководство для быстрого развертывания проекта.

## 🚀 За 5 минут

### 1. Подключитесь к серверу

```bash
ssh user@c.aurva.kg
```

### 2. Установите Docker (если еще не установлен)

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

### 3. Клонируйте проект

```bash
cd ~
git clone <URL-репозитория> aurva
cd aurva
```

### 4. Настройте переменные окружения

```bash
# Скопируйте файл
cp .env.production .env

# Сгенерируйте секретные ключи
JWT_SECRET=$(openssl rand -base64 32)
AUTH_JWT_SECRET=$(openssl rand -base64 32)

# Отредактируйте .env файл
nano .env
```

**Обязательно измените:**
- `JWT_SECRET` - вставьте сгенерированный ключ
- `AUTH_JWT_SECRET` - вставьте сгенерированный ключ
- `ADMIN_PASSWORD` - установите надежный пароль
- `EMAIL_USER` и `EMAIL_PASSWORD` - ваши email настройки

### 5. Запустите проект

```bash
docker compose -f docker-compose.production.yml up -d --build
```

### 6. Проверьте работу

```bash
# Проверка статуса
docker compose -f docker-compose.production.yml ps

# Просмотр логов
docker compose -f docker-compose.production.yml logs -f
```

## ✅ Готово!

Проект доступен по адресу: http://c.aurva.kg

Для настройки HTTPS см. полную инструкцию: `DEPLOY_C_AURVA_KG.md`

## 🔑 Вход в админ панель

URL: http://c.aurva.kg/admin
- Email: admin@aurva.kg (или из `ADMIN_EMAIL` в `.env`)
- Пароль: значение из `ADMIN_PASSWORD` в `.env`

## 📋 Полезные команды

```bash
# Остановить проект
docker compose -f docker-compose.production.yml down

# Перезапустить проект
docker compose -f docker-compose.production.yml restart

# Обновить проект
git pull && docker compose -f docker-compose.production.yml up -d --build

# Просмотр логов
docker compose -f docker-compose.production.yml logs -f backend
```

## 🐛 Проблемы?

См. подробный гайд: `DEPLOY_C_AURVA_KG.md` раздел Troubleshooting
