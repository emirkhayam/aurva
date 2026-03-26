# AURVA - Быстрый Старт Деплоя

**Дата:** 2026-03-26
**Проблема:** UDP порт 53 блокируется Proxmox → DNS не работает → Coolify не может подключиться к GitHub

---

## Экспресс-инструкция (5 минут)

### 1️⃣ Подключитесь к серверу
```bash
ssh aurva
```

### 2️⃣ Запустите диагностику DNS
```bash
# Скопируйте скрипт на сервер (один раз)
cat > check-dns.sh << 'EOF'
# ... содержимое check-dns.sh ...
EOF

chmod +x check-dns.sh

# Запустите диагностику
./check-dns.sh
```

### 3️⃣ Если UDP DNS не работает → Исправьте через Proxmox

**Вариант A - Web UI (проще):**

1. Откройте: https://p.aurva.kg
2. Войдите (CF Access + Keycloak)
3. VM aurva → Firewall → Add Rule
4. Настройки:
   ```
   Direction: OUT
   Action: ACCEPT
   Protocol: UDP
   Dest port: 53
   ```
5. Нажмите Apply

**Вариант B - SSH (быстрее):**

```bash
# Подключитесь к Proxmox
ssh root@p.aurva.kg

# Найдите ID VM aurva
qm list | grep aurva

# Создайте firewall правило (замените 101 на ваш ID)
cat > /etc/pve/firewall/101.fw << 'EOF'
[OPTIONS]
enable: 1

[RULES]
OUT ACCEPT -p udp -dport 53 -log nolog
OUT ACCEPT -p tcp -dport 53 -log nolog
EOF

# Примените
pve-firewall restart
```

### 4️⃣ Проверьте что DNS заработал

```bash
# На сервере aurva
ssh aurva

# Должен вернуть IP адреса (не timeout!)
dig @8.8.8.8 google.com +short

# Должен работать в Docker
sudo docker exec coolify nslookup api.github.com

# Должен вернуть цитату от GitHub
sudo docker exec coolify curl https://api.github.com/zen
```

### 5️⃣ Запустите Deploy в Coolify

1. Откройте: https://c.aurva.kg
2. Логин: `emilbekovemir85@gmail.com`
3. Пароль: `AurvaCool2026!`
4. Найдите проект AURVA
5. Нажмите **Redeploy**

### 6️⃣ Проверьте результат

```bash
# Статус контейнеров
ssh aurva "sudo docker ps | grep aurva"

# Проверьте сайт
curl -I https://aurva.kg

# Откройте в браузере
open https://aurva.kg
```

---

## Полезные ссылки

- **Полная инструкция:** `DEPLOY_STEPS.md`
- **Скрипт диагностики:** `check-dns.sh`
- **Скрипт исправления Proxmox:** `fix-proxmox-dns.sh`
- **История задач:** `REMAINING_TASKS.md`

---

## Доступы

| Сервис | URL | Логин | Пароль |
|--------|-----|-------|--------|
| SSH | `ssh aurva` | emilbekov | `AurvaSSH2026!` |
| Coolify | https://c.aurva.kg | emilbekovemir85@gmail.com | `AurvaCool2026!` |
| Proxmox | https://p.aurva.kg | emilbekovemir85@gmail.com | `AurvaDev2026!` |

---

## Диагностика проблем

### DNS не работает после исправления?

```bash
# Перезагрузите Docker
ssh aurva "sudo systemctl restart docker"

# Перезапустите Coolify
ssh aurva "sudo docker restart coolify"

# Повторите диагностику
ssh aurva "./check-dns.sh"
```

### Deploy падает с ошибкой?

```bash
# Проверьте логи Coolify
ssh aurva "sudo docker logs coolify --tail 100"

# Проверьте переменные окружения в Coolify UI
# Settings → Environment Variables → убедитесь что все Supabase переменные заполнены
```

### 502 Bad Gateway на сайте?

```bash
# Проверьте backend контейнер
ssh aurva "sudo docker ps | grep backend"
ssh aurva "sudo docker logs aurva-backend --tail 100"

# Проверьте порт 3000
ssh aurva "sudo netstat -tlnp | grep 3000"
```

---

## Альтернативный метод (если Coolify не работает)

### Deploy через Docker Compose напрямую

```bash
# Клонируйте репозиторий
ssh aurva
cd /opt
sudo git clone https://github.com/emirkhayam/aurva.git
cd aurva

# Создайте .env из примера
sudo cp .env.example .env
sudo nano .env
# Заполните переменные Supabase

# Запустите
sudo docker compose up -d

# Проверьте логи
sudo docker compose logs -f
```

---

## Контакты поддержки

- **Email:** aurva.kg@gmail.com
- **Телефон:** +996 550 99 90 10
- **GitHub:** https://github.com/emirkhayam/aurva

---

Generated with [Claude Code](https://claude.com/claude-code)
