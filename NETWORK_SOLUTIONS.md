# Решения сетевых проблем Coolify

## Проблема
DNS резолвинг не работает внутри контейнера Coolify, что приводит к ошибкам:
```
cURL error 28: Resolving timed out after 10001 milliseconds
```

## Диагностика

### Запустить скрипт диагностики
```bash
ssh aurva "bash -s" < diagnose-network.sh
```

Этот скрипт проверит:
- Статус контейнера Coolify
- DNS конфигурацию внутри контейнера
- Разрешение имен (nslookup)
- Ping к DNS серверам
- Доступность GitHub API
- Настройки Docker daemon
- Firewall правила

---

## Решение 1: Исправить DNS в Docker (Автоматически)

### Использовать скрипт автоматического исправления
```bash
scp fix-coolify-network.sh aurva:~/
ssh aurva "bash ~/fix-coolify-network.sh"
```

Этот скрипт:
1. Обновляет `/etc/docker/daemon.json` с DNS серверами
2. Перезапускает Docker daemon
3. Пересоздает контейнер Coolify с правильными DNS настройками
4. Тестирует подключение к GitHub API

---

## Решение 2: Ручное исправление DNS

### Шаг 1: Обновить Docker daemon DNS
```bash
ssh aurva "sudo tee /etc/docker/daemon.json" <<EOF
{
  "dns": ["8.8.8.8", "8.8.4.4", "1.1.1.1"],
  "dns-opts": ["ndots:0"]
}
EOF
```

### Шаг 2: Перезапустить Docker
```bash
ssh aurva "sudo systemctl restart docker"
```

### Шаг 3: Пересоздать контейнер Coolify
```bash
ssh aurva "sudo docker stop coolify && sudo docker rm coolify"
ssh aurva "sudo docker run -d \
  --name coolify \
  --restart unless-stopped \
  --dns 8.8.8.8 \
  --dns 8.8.4.4 \
  --dns 1.1.1.1 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v coolify-db:/var/lib/postgresql/data \
  -v coolify-data:/data \
  --network coolify \
  -p 8000:8000 \
  ghcr.io/coollabsio/coolify:latest"
```

### Шаг 4: Проверить DNS
```bash
ssh aurva "sudo docker exec coolify nslookup api.github.com"
ssh aurva "sudo docker exec coolify curl https://api.github.com/zen"
```

---

## Решение 3: Проверить и настроить Firewall

### Проверить статус UFW
```bash
ssh aurva "sudo ufw status verbose"
```

### Разрешить исходящие соединения (если заблокированы)
```bash
ssh aurva "sudo ufw allow out to any port 443"
ssh aurva "sudo ufw allow out to any port 53"
```

### Проверить iptables
```bash
ssh aurva "sudo iptables -L OUTPUT -n -v"
```

### Если iptables блокирует, добавить правила
```bash
ssh aurva "sudo iptables -A OUTPUT -p tcp --dport 443 -j ACCEPT"
ssh aurva "sudo iptables -A OUTPUT -p tcp --dport 53 -j ACCEPT"
ssh aurva "sudo iptables -A OUTPUT -p udp --dport 53 -j ACCEPT"
```

### Сохранить iptables правила (для Debian/Ubuntu)
```bash
ssh aurva "sudo apt-get install -y iptables-persistent"
ssh aurva "sudo netfilter-persistent save"
```

---

## Решение 4: Альтернативное развертывание (если Coolify не работает)

Если проблемы с Coolify не решаются, можно развернуть приложение напрямую через Docker Compose:

### Шаг 1: Клонировать репозиторий на сервер
```bash
ssh aurva "cd /opt && sudo git clone https://github.com/emirkhayam/aurva.git"
ssh aurva "cd /opt/aurva && sudo git checkout master"
```

### Шаг 2: Создать .env файл
```bash
ssh aurva "sudo tee /opt/aurva/.env" <<EOF
NODE_ENV=production
PORT=3000

# JWT
JWT_SECRET=SX6aA69J35iHTBfOXkZT70AN4YnsPq4y

# Supabase PostgreSQL
POSTGRES_HOST=supabase-db-a048ksg80wksowg4s0skogcw
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=q5rat5j7VaOE0qE8Qx9ZXklFzSeXYVY6
POSTGRES_SSL=false

# Supabase
SUPABASE_URL=https://supabasekong-a048ksg80wksowg4s0skogcw.aurva.kg
SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MjcxNDE2MCwiZXhwIjo0OTI4Mzg3NzYwLCJyb2xlIjoiYW5vbiJ9.c0IVF8EW1Fbu_BpAVhzNIOz2ILVSNH4GwXTob9sUdz8
SUPABASE_SERVICE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MjcxNDE2MCwiZXhwIjo0OTI4Mzg3NzYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.q8zI5BCSecVpWENTlewQB3wV4zola45Pt2U5j9bmvyw

# Auth
AUTH_JWT_SECRET=SX6aA69J35iHTBfOXkZT70AN4YnsPq4y
GOTRUE_SITE_URL=https://supabasekong-a048ksg80wksowg4s0skogcw.aurva.kg

# Storage
AWS_ACCESS_KEY_ID=mQtzVOY7iA1RpPmA
AWS_SECRET_ACCESS_KEY=Hqg7oy2tShDfWksk6ffUdUNOwfMPsMjL
MINIO_ROOT_USER=mQtzVOY7iA1RpPmA
MINIO_ROOT_PASSWORD=Hqg7oy2tShDfWksk6ffUdUNOwfMPsMjL

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=aurva.kg@gmail.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=aurva.kg@gmail.com

# Admin
ADMIN_EMAIL=admin@aurva.kg
ADMIN_PASSWORD=admin123

# CORS
CORS_ORIGIN=*

# Backend URL
BACKEND_URL=http://backend:3000
EOF
```

### Шаг 3: Запустить Docker Compose
```bash
ssh aurva "cd /opt/aurva && sudo docker compose up -d"
```

### Шаг 4: Проверить статус
```bash
ssh aurva "sudo docker ps"
ssh aurva "sudo docker logs aurva-backend-1 --tail 50"
ssh aurva "sudo docker logs aurva-admin-panel-1 --tail 50"
```

### Шаг 5: Проверить сайт
```bash
curl -I https://aurva.kg
```

---

## Решение 5: Использовать Coolify с локальным репозиторием

Если GitHub API недоступен из Coolify, можно настроить deploy из локального репозитория:

### Шаг 1: Клонировать репозиторий на сервер
```bash
ssh aurva "cd /opt && sudo git clone https://github.com/emirkhayam/aurva.git"
```

### Шаг 2: В Coolify изменить источник
1. Откройте настройки приложения в Coolify
2. Измените **Source Type** с "Git Repository" на "Local Path"
3. Укажите путь: `/opt/aurva`

### Шаг 3: Настроить автоматический pull
```bash
ssh aurva "sudo crontab -e"
```

Добавьте:
```
*/5 * * * * cd /opt/aurva && git pull origin master
```

---

## Решение 6: Проверить сеть Proxmox (если проблема на уровне хоста)

### Проверить DNS на хосте aurva
```bash
ssh aurva "cat /etc/resolv.conf"
ssh aurva "nslookup api.github.com"
ssh aurva "curl https://api.github.com/zen"
```

### Если DNS не работает на хосте
```bash
ssh aurva "sudo tee /etc/resolv.conf" <<EOF
nameserver 8.8.8.8
nameserver 8.8.4.4
nameserver 1.1.1.1
EOF
```

### Проверить маршрутизацию
```bash
ssh aurva "ip route show"
ssh aurva "ping -c 3 8.8.8.8"
```

### Если нет маршрута к интернету, проверить шлюз
```bash
ssh aurva "ip route add default via 10.10.10.1 dev eth0"
```

---

## Диагностические команды

### Проверить DNS в контейнере
```bash
ssh aurva "sudo docker exec coolify cat /etc/resolv.conf"
ssh aurva "sudo docker exec coolify nslookup api.github.com"
```

### Проверить сетевые настройки контейнера
```bash
ssh aurva "sudo docker inspect coolify | grep -A 30 NetworkSettings"
```

### Проверить логи Coolify
```bash
ssh aurva "sudo docker logs coolify --tail 100"
```

### Проверить логи Docker daemon
```bash
ssh aurva "sudo journalctl -u docker.service --no-pager | tail -50"
```

---

## Тестирование после исправлений

### 1. Проверить DNS
```bash
ssh aurva "sudo docker exec coolify nslookup api.github.com"
```

Ожидаемый результат:
```
Server:		8.8.8.8
Address:	8.8.8.8#53

Non-authoritative answer:
Name:	api.github.com
Address: 140.82.113.5
```

### 2. Проверить GitHub API
```bash
ssh aurva "sudo docker exec coolify curl https://api.github.com/zen"
```

Ожидаемый результат: Цитата от GitHub (например: "Design for failure.")

### 3. Запустить deploy в Coolify
1. Откройте Coolify UI: https://coolify.aurva.kg
2. Перейдите к приложению AURVA
3. Нажмите "Redeploy"
4. Мониторьте логи

### 4. Проверить сайт после deploy
```bash
curl -I https://aurva.kg
```

Ожидаемый результат: HTTP 200 OK

---

## Контакты

Если ни одно из решений не помогло:
1. Проверьте логи Docker: `sudo journalctl -u docker`
2. Проверьте логи Coolify: `sudo docker logs coolify`
3. Обратитесь к документации Coolify: https://coolify.io/docs
4. Рассмотрите альтернативные варианты развертывания (Docker Compose, GitHub Actions, Vercel)

---

**Последнее обновление:** 2026-03-06
**Автор:** Claude Code Assistant
