# Исправление SSH доступа к AURVA

**Проблема:** Email не имеет доступа через Cloudflare Access для SSH
**Ошибка:** "That account does not have access"

---

## Решение 1: Настроить Cloudflare Access (нужен admin доступ)

### Через Cloudflare Dashboard:

1. **Откройте Cloudflare Zero Trust:**
   ```
   https://one.dash.cloudflare.com/
   ```

2. **Войдите в аккаунт Cloudflare** (тот, который управляет aurva.kg)

3. **Перейдите в Access → Applications:**
   - Найдите приложение для `ssh.aurva.kg`
   - Или создайте новое, если его нет

4. **Добавьте Email в Policy:**
   - Edit Application → Policies
   - Add a Rule или Edit существующее правило
   - Include: Emails → `emilbekovemir85@gmail.com`
   - Save

5. **Подождите 1-2 минуты** для применения изменений

6. **Попробуйте снова:**
   ```bash
   ssh aurva
   ```

---

## Решение 2: Использовать Proxmox для прямого доступа

Если у вас есть доступ к Proxmox Web UI:

### 2.1. Откройте Proxmox:
```
https://p.aurva.kg
```

### 2.2. Войдите через Cloudflare Access + Keycloak

### 2.3. Найдите VM aurva в списке виртуальных машин

### 2.4. Используйте консоль:
- Выберите VM aurva
- Нажмите "Console" (>_ Shell)
- Войдите:
  - Username: `emilbekov`
  - Password: `AurvaSSH2026!`

### 2.5. Получите root:
```bash
sudo su
```

### 2.6. Выполните команды деплоя:
```bash
# Запустите скрипт диагностики
cd ~
cat > check-dns.sh << 'EOF'
#!/bin/bash
echo "Проверка DNS..."
dig @8.8.8.8 google.com +short
dig @8.8.8.8 google.com +tcp +short
sudo docker exec coolify nslookup api.github.com
EOF

chmod +x check-dns.sh
./check-dns.sh
```

---

## Решение 3: Временный доступ через Keycloak

Возможно, вам нужно использовать другой email для SSH доступа.

### Попробуйте другие варианты email:

Если есть доступ к Keycloak (https://keycloak.aurva.kg):
- Проверьте какой email используется для вашего аккаунта
- Используйте этот email для SSH

---

## Решение 4: Прямое подключение через IP (если открыт порт)

Если SSH порт открыт напрямую:

```bash
# Попробуйте подключиться напрямую
ssh emilbekov@aurva.kg

# Или через IP (если известен публичный IP)
ssh emilbekov@<IP-адрес>
```

Пароль: `AurvaSSH2026!`

---

## Решение 5: Настроить локальный туннель через Cloudflared

Создайте локальный туннель:

```bash
# Запустите туннель
cloudflared access ssh --hostname ssh.aurva.kg --url localhost:2222

# В другом терминале подключитесь
ssh emilbekov@localhost -p 2222
```

---

## Временное решение: Использовать Web UI для всех операций

Пока SSH не работает, используйте Web интерфейсы:

### Для диагностики DNS:
1. Откройте Proxmox: https://p.aurva.kg
2. VM aurva → Console
3. Выполните команды проверки DNS

### Для деплоя:
1. Откройте Coolify: https://c.aurva.kg
2. Логин: `emilbekovemir85@gmail.com`
3. Пароль: `AurvaCool2026!`
4. Найдите проект AURVA
5. Нажмите Redeploy

---

## Кто может помочь настроить Cloudflare Access?

**Нужен доступ администратора к:**
- Cloudflare Dashboard для домена aurva.kg
- Zero Trust / Access настройкам

**Администратор должен:**
1. Добавить ваш email в Access Policy для ssh.aurva.kg
2. Или создать новое Access приложение для SSH

**Контакты для поддержки:**
- Email: aurva.kg@gmail.com
- Телефон: +996 550 99 90 10

---

## Следующие шаги

### Если вы администратор Cloudflare:
→ Следуйте **Решению 1**

### Если у вас есть доступ к Proxmox:
→ Следуйте **Решению 2**

### Если ничего не работает:
→ Используйте **Решение 5** (Временное - Web UI)

---

## После получения доступа

Как только SSH заработает, выполните:

```bash
ssh aurva

# Скопируйте и запустите скрипт из RUN_THIS.md
# Он автоматически:
# - Проверит DNS
# - Исправит проблемы
# - Подготовит к деплою
```

---

Generated with [Claude Code](https://claude.com/claude-code)
