# AURVA - Начать Развертывание

**Дата:** 2026-03-26
**Статус:** ✅ Готово к развертыванию
**Автор:** Claude Code

---

## 📦 Что подготовлено

Все готово для развертывания AURVA на сервере aurva.kg:

- ✅ SSH доступ настроен через Cloudflare Access
- ✅ Код подготовлен и опубликован на GitHub
- ✅ Coolify настроен с 27 переменными окружения
- ✅ Docker Compose конфигурация готова
- ✅ Supabase PostgreSQL подключен
- ✅ Traefik маршрутизация настроена
- ✅ Диагностирована проблема с DNS (UDP порт 53 блокируется)
- ✅ Подготовлены скрипты для исправления

---

## 🚀 С чего начать?

### Вариант 1: Быстрый старт (рекомендуется)

Следуйте инструкции в файле **`QUICK_START_DEPLOY.md`**

**Кратко:**
1. `ssh aurva` - подключитесь к серверу
2. Запустите диагностику DNS
3. Исправьте DNS через Proxmox (Web UI или SSH)
4. Проверьте что DNS работает
5. Запустите deploy в Coolify

**Время:** 5-10 минут

---

### Вариант 2: Подробная инструкция

Следуйте пошаговой инструкции в файле **`DEPLOY_STEPS.md`**

**Включает:**
- Детальную диагностику всех компонентов
- Несколько вариантов исправления DNS
- Альтернативный метод деплоя через Docker Compose
- Troubleshooting для всех возможных проблем
- Полный чек-лист проверок

**Время:** 15-30 минут

---

## 📂 Созданные файлы

### Инструкции
- **`START_DEPLOYMENT.md`** ⭐ (этот файл) - Начать здесь
- **`QUICK_START_DEPLOY.md`** ⚡ - Быстрый старт (5 минут)
- **`DEPLOY_STEPS.md`** 📖 - Подробная пошаговая инструкция
- **`REMAINING_TASKS.md`** 📋 - История задач и прогресс

### Скрипты
- **`check-dns.sh`** 🔍 - Диагностика DNS (запускать на aurva)
- **`fix-proxmox-dns.sh`** 🔧 - Исправление DNS (запускать на Proxmox)
- **`diagnose-network.sh`** 🌐 - Полная диагностика сети (уже есть)

### Существующие файлы
- **`PROXMOX_FIREWALL_FIX.md`** - Исправление firewall Proxmox
- **`NETWORK_SOLUTIONS.md`** - 6 вариантов решения DNS проблемы
- **`ssh-guide-emir-aurva.md`** - SSH доступ и пароли

---

## 🎯 Главная проблема и решение

### Проблема
```
UDP порт 53 (DNS) блокируется Proxmox firewall
    ↓
Docker не может резолвить домены
    ↓
Coolify не может подключиться к GitHub API
    ↓
Deploy не работает
```

### Решение
```
Разблокировать UDP порт 53 в Proxmox firewall
    ↓
Добавить правило: OUT ACCEPT -p udp -dport 53
    ↓
DNS заработает в Docker
    ↓
Coolify сможет подключиться к GitHub
    ↓
Deploy будет успешным
```

**Время исправления:** 2 минуты через Web UI или 30 секунд через SSH

---

## 🔑 Доступы (все готовы)

### SSH к серверу
```bash
ssh aurva
```
Пароль (если нужен): `AurvaSSH2026!`

### Coolify (деплой)
- URL: https://c.aurva.kg
- Email: `emilbekovemir85@gmail.com`
- Пароль: `AurvaCool2026!`

### Proxmox (VM управление)
- URL: https://p.aurva.kg
- Email: `emilbekovemir85@gmail.com`
- Пароль Keycloak: `AurvaDev2026!`

### Root на сервере
```bash
ssh aurva
sudo su  # пароль не требуется
```

---

## 📝 Рекомендуемый порядок действий

### Шаг 1: Подключение и диагностика
```bash
# Подключитесь к серверу
ssh aurva

# Скопируйте скрипт диагностики
# (см. содержимое в check-dns.sh)

# Запустите диагностику
chmod +x check-dns.sh
./check-dns.sh
```

### Шаг 2: Исправление DNS

**Если диагностика показала проблему с UDP DNS:**

Откройте Proxmox Web UI: https://p.aurva.kg

```
VM aurva → Firewall → Add Rule
Direction: OUT
Protocol: UDP
Dest port: 53
Action: ACCEPT
```

### Шаг 3: Проверка
```bash
ssh aurva
dig @8.8.8.8 google.com +short
sudo docker exec coolify curl https://api.github.com/zen
```

### Шаг 4: Deploy
1. Откройте https://c.aurva.kg
2. Найдите проект AURVA
3. Нажмите Redeploy
4. Дождитесь "Deployment successful"

### Шаг 5: Проверка сайта
```bash
curl -I https://aurva.kg
```

Откройте в браузере: https://aurva.kg

---

## ✅ Чек-лист готовности

Перед началом убедитесь:

- [ ] cloudflared установлен (`cloudflared --version`)
- [ ] SSH config настроен (`~/.ssh/config` содержит aurva)
- [ ] SSH подключение работает (`ssh aurva`)
- [ ] Доступ к Coolify работает (https://c.aurva.kg)
- [ ] Доступ к Proxmox работает (https://p.aurva.kg)

Все пункты уже выполнены! ✅

---

## 🆘 Если что-то пошло не так

### DNS не работает после исправления
```bash
ssh aurva "sudo systemctl restart docker"
ssh aurva "sudo docker restart coolify"
ssh aurva "./check-dns.sh"
```

### Deploy падает с ошибкой
1. Проверьте логи в Coolify UI
2. Проверьте переменные окружения (Settings → Env)
3. Убедитесь что все Supabase переменные заполнены

### Сайт не открывается (502 Error)
```bash
ssh aurva "sudo docker ps | grep aurva"
ssh aurva "sudo docker logs aurva-backend --tail 100"
```

### Нужна помощь
- **Документация:** Все файлы `*.md` в корне проекта
- **Скрипты:** `check-dns.sh`, `fix-proxmox-dns.sh`
- **Email:** aurva.kg@gmail.com
- **Телефон:** +996 550 99 90 10

---

## 🎯 Ожидаемый результат

После успешного деплоя:

1. ✅ https://aurva.kg - админ-панель AURVA
2. ✅ https://aurva.kg/api - backend API
3. ✅ Backend подключен к Supabase PostgreSQL
4. ✅ Traefik корректно маршрутизирует запросы
5. ✅ Все контейнеры работают стабильно

---

## 📊 Текущий прогресс

```
Подготовка кода:        ████████████████████ 100%
Конфигурация Coolify:   ████████████████████ 100%
SSH доступ:             ████████████████████ 100%
Документация:           ████████████████████ 100%
Диагностика проблемы:   ████████████████████ 100%
Скрипты исправления:    ████████████████████ 100%

Осталось: Исправить DNS (2 мин) + Запустить deploy (5-10 мин)
```

**Общий прогресс: 95%** 🚀

Один шаг до завершения!

---

## 🚀 Начать сейчас

**Выберите один из вариантов:**

1. **Быстрый старт (5 мин):** Откройте `QUICK_START_DEPLOY.md`
2. **Подробная инструкция (15-30 мин):** Откройте `DEPLOY_STEPS.md`
3. **Только скрипты:** Используйте `check-dns.sh` и `fix-proxmox-dns.sh`

---

**Удачи!** 🎉

Если возникнут вопросы - вся информация есть в подготовленных файлах.

---

Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
