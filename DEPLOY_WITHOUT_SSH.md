# Развертывание AURVA без SSH (только Web UI)

**Проблема:** SSH доступ через Cloudflare Access не работает
**Решение:** Используем Web интерфейсы Proxmox и Coolify

---

## ✅ Что нужно сделать (2 варианта)

---

## Вариант 1: Deploy через Coolify Web UI (ПРОЩЕ)

### Шаг 1: Откройте Coolify

```
https://c.aurva.kg
```

### Шаг 2: Войдите

- **Email:** `emilbekovemir85@gmail.com`
- **Пароль:** `AurvaCool2026!`

### Шаг 3: Найдите проект AURVA

- В левом меню: **Projects** или **Applications**
- Найдите приложение с именем **AURVA** или похожим

### Шаг 4: Проверьте переменные окружения

1. Откройте приложение AURVA
2. Перейдите: **Settings** → **Environment Variables**
3. Убедитесь что заполнены все переменные Supabase:
   - `POSTGRES_USER`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DB`
   - `POSTGRES_HOST`
   - `POSTGRES_PORT`
   - `DATABASE_URL`

### Шаг 5: Запустите Deploy

1. Вернитесь на главную страницу приложения
2. Нажмите **"Redeploy"** или **"Force Redeploy"**
3. Подтвердите действие

### Шаг 6: Следите за логами

- Логи деплоя будут отображаться в реальном времени
- Дождитесь сообщения **"Deployment successful"**
- Процесс может занять 5-15 минут

### Шаг 7: Проверьте результат

Откройте в браузере:
```
https://aurva.kg
```

Должна открыться админ-панель AURVA.

---

## Вариант 2: Через Proxmox Console (если Coolify не работает)

### Шаг 1: Откройте Proxmox

```
https://p.aurva.kg
```

### Шаг 2: Войдите

- **Email:** `emilbekovemir85@gmail.com`
- **Пароль (Keycloak):** `AurvaDev2026!`

### Шаг 3: Найдите VM aurva

- В левом меню найдите виртуальную машину **aurva**
- Кликните на неё

### Шаг 4: Откройте консоль

- Нажмите кнопку **Console** (иконка >_ Shell или noVNC)
- Откроется терминал виртуальной машины

### Шаг 5: Войдите в систему

В консоли введите:
- **Username:** `emilbekov`
- **Password:** `AurvaSSH2026!`

### Шаг 6: Получите root права

```bash
sudo su
```
(пароль не требуется)

### Шаг 7: Проверьте DNS

Скопируйте и вставьте в консоль:

```bash
# Проверка UDP DNS
dig @8.8.8.8 google.com +short

# Проверка TCP DNS
dig @8.8.8.8 google.com +tcp +short

# Проверка Docker DNS
docker exec coolify nslookup api.github.com
```

**Ожидаемые результаты:**
- UDP DNS должен вернуть IP адреса (если возвращает - всё ОК)
- TCP DNS должен работать
- Docker DNS должен работать

### Шаг 8: Если UDP DNS не работает

#### Исправление через Proxmox Firewall:

1. Вернитесь в Proxmox Web UI
2. Выберите VM **aurva**
3. Перейдите: **Firewall** → **Options**
4. Убедитесь что Firewall включен
5. Перейдите: **Firewall** → **Add** (добавить правило)
6. Заполните:
   - **Direction:** `OUT`
   - **Action:** `ACCEPT`
   - **Protocol:** `UDP`
   - **Dest. port:** `53`
   - **Comment:** `Allow DNS queries`
7. Нажмите **Add**
8. Нажмите **Apply Configuration**

#### Проверка после исправления:

Вернитесь в Console и выполните:
```bash
dig @8.8.8.8 google.com +short
```

Должны вернуться IP адреса Google.

### Шаг 9: Проверьте Coolify

```bash
docker ps | grep coolify
docker logs coolify --tail 50
```

### Шаг 10: Исправьте Docker DNS (если нужно)

Если Docker DNS не работает:

```bash
# Создайте/обновите Docker daemon.json
cat > /etc/docker/daemon.json << 'EOF'
{
  "dns": ["8.8.8.8", "8.8.4.4", "1.1.1.1"]
}
EOF

# Перезапустите Docker
systemctl restart docker

# Подождите 5 секунд
sleep 5

# Перезапустите Coolify
docker restart coolify

# Подождите 10 секунд
sleep 10

# Проверьте DNS в Docker
docker exec coolify nslookup api.github.com
```

### Шаг 11: Запустите deploy

После исправления DNS:
1. Вернитесь в Coolify Web UI: https://c.aurva.kg
2. Найдите проект AURVA
3. Нажмите **Redeploy**

---

## Вариант 3: Deploy через Docker Compose (альтернатива)

Если Coolify не работает, можно развернуть напрямую через Docker Compose.

### Через Proxmox Console:

```bash
# Войдите в систему (см. Вариант 2, Шаги 1-6)

# Клонируйте репозиторий
cd /opt
git clone https://github.com/emirkhayam/aurva.git
cd aurva

# Создайте .env из примера
cp .env.example .env

# Отредактируйте .env
nano .env
```

### Заполните переменные в .env:

```env
# PostgreSQL (Supabase)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<ваш пароль>
POSTGRES_DB=postgres
POSTGRES_HOST=<хост Supabase>
POSTGRES_PORT=5432
POSTGRES_SSL=true

# Database URL
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<db>?sslmode=require

# Backend
PORT=3000
NODE_ENV=production
JWT_SECRET=<генерируйте длинный случайный ключ>
ADMIN_EMAIL=admin@aurva.kg
ADMIN_PASSWORD=<установите пароль администратора>

# Frontend URLs
NEXT_PUBLIC_API_URL=https://aurva.kg/api
NEXT_PUBLIC_BASE_URL=https://aurva.kg
```

### Запустите:

```bash
# Запустите контейнеры
docker compose up -d

# Проверьте логи
docker compose logs -f
```

Нажмите `Ctrl+C` чтобы выйти из логов.

### Проверьте результат:

```bash
# Статус контейнеров
docker compose ps

# Проверьте сайт
curl -I https://aurva.kg
```

---

## Проверка результата (для всех вариантов)

### 1. Проверьте контейнеры

Через Proxmox Console:
```bash
docker ps | grep aurva
```

Должны быть запущены:
- `aurva-backend`
- `aurva-admin-panel`

### 2. Проверьте логи

```bash
docker logs aurva-backend --tail 50
docker logs aurva-admin-panel --tail 50
```

Не должно быть ошибок подключения к БД.

### 3. Проверьте сайт

В браузере откройте:
```
https://aurva.kg
```

Должна открыться админ-панель AURVA.

---

## Troubleshooting

### Coolify показывает ошибку при деплое?

**Проверьте логи:**
1. В Coolify UI → Deployments → Latest deployment
2. Посмотрите логи развертывания
3. Найдите ошибку

**Частые проблемы:**
- DNS не работает → Исправьте через Proxmox Firewall (Вариант 2, Шаг 8)
- Переменные окружения не заполнены → Проверьте Settings → Environment Variables
- GitHub недоступен → Проверьте DNS в Docker

### Сайт показывает 502 Bad Gateway?

**Причина:** Backend не отвечает

**Решение:**
```bash
# Через Proxmox Console
docker ps | grep backend
docker logs aurva-backend --tail 100

# Перезапустите backend
docker restart aurva-backend
```

### Docker Compose deploy не работает?

**Проверьте .env:**
- Все переменные Supabase заполнены?
- DATABASE_URL правильный?
- Порты не заняты?

**Проверьте порты:**
```bash
netstat -tlnp | grep -E "3000|80|443"
```

---

## Контакты

- **Email:** aurva.kg@gmail.com
- **Телефон:** +996 550 99 90 10

---

## После успешного деплоя

### Исправьте SSH доступ

Чтобы в будущем иметь SSH доступ, нужно настроить Cloudflare Access:

1. Откройте: https://one.dash.cloudflare.com/
2. Access → Applications
3. Найдите ssh.aurva.kg
4. Добавьте свой email в разрешенные пользователи

См. подробности в файле: **FIX_SSH_ACCESS.md**

---

**Удачи!** Используйте Web UI - это даже проще чем SSH.

Generated with [Claude Code](https://claude.com/claude-code)
