# Быстрое исправление сети Coolify

## Проблема
❌ DNS не работает в Coolify → GitHub API недоступен → Deploy не работает

## Быстрое решение (5 минут)

### Вариант A: Автоматическое исправление (РЕКОМЕНДУЕТСЯ)

```bash
# 1. Скопировать скрипт на сервер
scp fix-coolify-network.sh aurva:~/

# 2. Запустить скрипт
ssh aurva "bash ~/fix-coolify-network.sh"

# 3. Проверить результат
ssh aurva "sudo docker exec coolify curl https://api.github.com/zen"
```

Если команда выше возвращает цитату GitHub → ✅ **Проблема решена!**

Теперь можно запустить deploy в Coolify UI.

---

### Вариант B: Ручное исправление (3 команды)

```bash
# 1. Обновить Docker DNS
ssh aurva 'sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "dns": ["8.8.8.8", "8.8.4.4", "1.1.1.1"]
}
EOF'

# 2. Перезапустить Docker и Coolify
ssh aurva "sudo systemctl restart docker && sleep 10 && sudo docker restart coolify"

# 3. Проверить
ssh aurva "sudo docker exec coolify curl https://api.github.com/zen"
```

---

### Вариант C: Если ничего не помогает

Развернуть напрямую через Docker Compose (без Coolify):

```bash
# 1. Клонировать на сервер
ssh aurva "cd /opt && sudo git clone https://github.com/emirkhayam/aurva.git"

# 2. Создать .env файл
# (см. NETWORK_SOLUTIONS.md раздел "Решение 4")

# 3. Запустить
ssh aurva "cd /opt/aurva && sudo docker compose up -d"

# 4. Проверить
ssh aurva "sudo docker ps"
curl https://aurva.kg
```

---

## Диагностика

Если нужно понять, в чем проблема:

```bash
# Скопировать скрипт диагностики
scp diagnose-network.sh aurva:~/

# Запустить
ssh aurva "bash ~/diagnose-network.sh"
```

---

## Что делать после исправления

### ✅ Если DNS заработал:

1. Откройте Coolify UI: https://coolify.aurva.kg
2. Перейдите к приложению AURVA
3. Нажмите **"Redeploy"**
4. Дождитесь успешного завершения
5. Проверьте сайт: https://aurva.kg

### ❌ Если DNS все еще не работает:

1. Проверьте firewall: `ssh aurva "sudo ufw status"`
2. Проверьте сеть на хосте: `ssh aurva "curl https://api.github.com/zen"`
3. См. полный список решений: `NETWORK_SOLUTIONS.md`

---

## Проверка успешности

```bash
# DNS работает?
ssh aurva "sudo docker exec coolify nslookup api.github.com"

# GitHub доступен?
ssh aurva "sudo docker exec coolify curl https://api.github.com/zen"

# Сайт работает?
curl -I https://aurva.kg
```

Все 3 команды должны работать без ошибок.

---

## Файлы в проекте

- `diagnose-network.sh` - Диагностика проблем (10 тестов)
- `fix-coolify-network.sh` - Автоматическое исправление
- `NETWORK_SOLUTIONS.md` - Все возможные решения (6 вариантов)
- `REMAINING_TASKS.md` - Прогресс развертывания
- `COOLIFY_SETUP_GUIDE.md` - Настройка Coolify

---

**Время выполнения:** 5 минут
**Уровень сложности:** Легкий
**Последнее обновление:** 2026-03-06
