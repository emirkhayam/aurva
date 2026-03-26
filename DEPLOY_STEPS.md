# AURVA Deployment - Пошаговая Инструкция

**Дата:** 2026-03-26
**Статус:** Готово к развертыванию
**Проблема:** UDP порт 53 (DNS) блокируется Proxmox firewall

---

## ШАГ 1: Подключение к серверу

### 1.1. Проверка cloudflared
```bash
cloudflared --version
```

### 1.2. Подключение по SSH
```bash
ssh aurva
```

**При первом подключении:**
- Откроется браузер → страница CF Access
- Войдите: `emilbekovemir85@gmail.com` / `AurvaDev2026!`
- Вернитесь в терминал - SSH подключится автоматически

**Если нужен пароль SSH:** `AurvaSSH2026!`

---

## ШАГ 2: Диагностика DNS проблемы

### 2.1. Проверка текущего состояния DNS
```bash
# Проверка UDP DNS (должно быть timeout)
dig @8.8.8.8 google.com +short +time=5

# Проверка TCP DNS (должно работать)
dig @8.8.8.8 google.com +tcp +short

# Если UDP не работает, а TCP работает - это наша проблема!
```

### 2.2. Проверка Docker DNS
```bash
# Проверка Coolify контейнера
sudo docker exec coolify nslookup api.github.com

# Если выдает timeout - DNS не работает в контейнерах
```

### 2.3. Проверка Docker логов
```bash
sudo docker logs coolify --tail 100 2>&1 | grep -i dns
```

**Ожидаемый результат:** Ошибки типа `i/o timeout` или `dial udp timeout`

---

## ШАГ 3: Исправление DNS через Proxmox Web UI

### Вариант A: Через Web UI (рекомендуется)

**3.1. Откройте Proxmox:**
```
https://p.aurva.kg
```

**Логин:**
- Email: `emilbekovemir85@gmail.com`
- Пароль CF Access: `AurvaDev2026!`
- Затем вход через Keycloak

**3.2. Найдите VM aurva:**
- В левом меню найдите VM с именем `aurva` (ID: 101 или похожий)

**3.3. Настройка Firewall:**
1. Выберите VM `aurva`
2. Перейдите: **Firewall** → **Options**
3. Убедитесь что Firewall **Enabled** (включен)
4. Нажмите **Add** (добавить правило)

**3.4. Добавьте правило для DNS:**
```
Direction: OUT (исходящий)
Action: ACCEPT
Protocol: UDP
Destination port: 53
Comment: Allow DNS queries
```

5. Нажмите **Add**
6. Нажмите **Apply** для применения правил

---

### Вариант B: Через SSH к Proxmox (если есть прямой доступ)

**3.1. Проверьте доступ к Proxmox:**
```bash
ssh root@p.aurva.kg
```

**3.2. Найдите ID виртуальной машины:**
```bash
qm list | grep aurva
```

**3.3. Добавьте правило firewall:**
```bash
# Замените 101 на реальный ID VM, если отличается
VM_ID=101

# Создайте/обновите firewall конфигурацию
cat > /etc/pve/firewall/${VM_ID}.fw << 'EOF'
[OPTIONS]
enable: 1

[RULES]
OUT ACCEPT -p udp -dport 53 -log nolog # Allow DNS queries
OUT ACCEPT -p tcp -dport 53 -log nolog # Allow DNS over TCP
EOF
```

**3.4. Примените изменения:**
```bash
# Рестарт firewall
pve-firewall restart

# Проверка статуса
pve-firewall status
```

---

## ШАГ 4: Проверка что DNS заработал

**4.1. Вернитесь к серверу aurva:**
```bash
ssh aurva
```

**4.2. Проверьте UDP DNS (должен работать!):**
```bash
# Должен вернуть IP адреса Google
dig @8.8.8.8 google.com +short

# Должен вернуть IP без timeout
dig @8.8.4.4 github.com +short
```

**4.3. Проверьте DNS в Docker:**
```bash
# Должен вернуть адрес api.github.com
sudo docker exec coolify nslookup api.github.com

# Должен вернуть цитату от GitHub (не ошибку timeout!)
sudo docker exec coolify curl -s https://api.github.com/zen
```

**Ожидаемые результаты:**
- ✅ `dig` возвращает IP адреса
- ✅ `nslookup` возвращает адрес
- ✅ `curl` возвращает текст цитаты от GitHub

**Если все работает - DNS исправлен! Переходите к Шагу 5.**

---

## ШАГ 5: Deploy приложения через Coolify

### 5.1. Откройте Coolify UI
```
https://c.aurva.kg
```

**Логин:**
- Email: `emilbekovemir85@gmail.com`
- Пароль CF Access: `AurvaDev2026!`
- Пароль Coolify: `AurvaCool2026!`

### 5.2. Найдите приложение AURVA
1. В левом меню: **Projects**
2. Найдите проект **AURVA** или похожий
3. Откройте приложение

### 5.3. Запустите Redeploy
1. Нажмите кнопку **Redeploy** или **Force Redeploy**
2. Подтвердите действие

### 5.4. Следите за логами деплоя
- Логи будут отображаться в реальном времени
- Дождитесь сообщения "Deployment successful" или похожего

**Процесс может занять 5-15 минут.**

---

## ШАГ 6: Проверка работы сайта

### 6.1. Проверьте статус контейнеров
```bash
ssh aurva "sudo docker ps | grep aurva"
```

**Должны быть запущены:**
- `aurva-backend` (или похожее имя)
- `aurva-admin-panel`

### 6.2. Проверьте логи контейнеров
```bash
# Backend логи
ssh aurva "sudo docker logs aurva-backend --tail 50"

# Admin Panel логи
ssh aurva "sudo docker logs aurva-admin-panel --tail 50"
```

### 6.3. Проверьте доступность сайта
```bash
curl -I https://aurva.kg
```

**Ожидаемый результат:**
```
HTTP/2 200
...
```

### 6.4. Откройте в браузере
```
https://aurva.kg
```

**Должна открыться админ-панель AURVA.**

---

## ШАГ 7: Проверка работоспособности

### 7.1. Проверьте Backend API
```bash
# Проверка health endpoint
curl https://aurva.kg/api/health

# Или через внутренний адрес
ssh aurva "curl -s http://localhost:3000/api/health"
```

### 7.2. Проверьте подключение к Supabase
```bash
ssh aurva "sudo docker logs aurva-backend --tail 100 | grep -i supabase"
```

**Не должно быть ошибок подключения к БД.**

### 7.3. Проверьте Traefik маршрутизацию
```bash
ssh aurva "sudo docker logs traefik --tail 50"
```

---

## Альтернативный метод (если Coolify не работает)

### Deploy через Docker Compose напрямую

**A.1. Клонируйте репозиторий на сервер:**
```bash
ssh aurva
cd /opt
sudo git clone https://github.com/emirkhayam/aurva.git
cd aurva
```

**A.2. Создайте .env файл:**
```bash
sudo nano .env
```

Скопируйте содержимое из `.env.example` и заполните переменные Supabase.

**A.3. Запустите через Docker Compose:**
```bash
sudo docker compose -f docker-compose.yml up -d
```

**A.4. Проверьте логи:**
```bash
sudo docker compose logs -f
```

---

## Troubleshooting (Решение проблем)

### Проблема: DNS все еще не работает

**Решение 1:** Перезапустите Docker daemon
```bash
ssh aurva "sudo systemctl restart docker"
```

**Решение 2:** Обновите DNS в Docker daemon
```bash
ssh aurva "sudo nano /etc/docker/daemon.json"
```

Добавьте:
```json
{
  "dns": ["8.8.8.8", "8.8.4.4", "1.1.1.1"]
}
```

Затем:
```bash
ssh aurva "sudo systemctl restart docker"
ssh aurva "sudo docker restart coolify"
```

### Проблема: Coolify не может подключиться к GitHub

**Проверьте:**
```bash
ssh aurva "sudo docker exec coolify curl -v https://api.github.com/zen"
```

Если timeout - DNS проблема не исправлена.

### Проблема: Контейнеры не запускаются

**Проверьте логи:**
```bash
ssh aurva "sudo docker compose -f /path/to/docker-compose.yml logs"
```

**Проверьте переменные окружения в Coolify:**
1. Откройте приложение в Coolify
2. Settings → Environment Variables
3. Убедитесь что все переменные Supabase заполнены

### Проблема: 502 Bad Gateway

**Причина:** Backend не отвечает

**Проверьте:**
```bash
# Статус контейнера
ssh aurva "sudo docker ps | grep backend"

# Логи backend
ssh aurva "sudo docker logs aurva-backend --tail 100"

# Проверка порта
ssh aurva "sudo netstat -tlnp | grep 3000"
```

---

## Полезные команды

### Перезапуск Coolify
```bash
ssh aurva "sudo docker restart coolify"
```

### Просмотр всех контейнеров
```bash
ssh aurva "sudo docker ps -a"
```

### Остановка всех контейнеров AURVA
```bash
ssh aurva "sudo docker ps | grep aurva | awk '{print \$1}' | xargs sudo docker stop"
```

### Очистка неиспользуемых образов
```bash
ssh aurva "sudo docker system prune -a"
```

### Проверка использования диска
```bash
ssh aurva "df -h"
ssh aurva "sudo docker system df"
```

---

## Итоговый чек-лист

### Перед деплоем:
- [ ] SSH доступ к серверу aurva работает
- [ ] cloudflared установлен и настроен
- [ ] Доступ к Proxmox Web UI работает
- [ ] Доступ к Coolify Web UI работает

### После исправления DNS:
- [ ] `dig @8.8.8.8 google.com` возвращает IP
- [ ] `docker exec coolify nslookup api.github.com` работает
- [ ] `docker exec coolify curl https://api.github.com/zen` возвращает цитату

### После деплоя:
- [ ] Контейнеры `aurva-backend` и `aurva-admin-panel` запущены
- [ ] `curl -I https://aurva.kg` возвращает HTTP 200
- [ ] Сайт https://aurva.kg открывается в браузере
- [ ] Backend API отвечает на запросы
- [ ] Подключение к Supabase работает

---

## Контакты

- **Email:** aurva.kg@gmail.com
- **Телефон:** +996 550 99 90 10
- **GitHub:** https://github.com/emirkhayam/aurva
- **Coolify:** https://c.aurva.kg
- **Proxmox:** https://p.aurva.kg

---

**Последнее обновление:** 2026-03-26
**Автор:** Claude Code

Generated with [Claude Code](https://claude.com/claude-code)
