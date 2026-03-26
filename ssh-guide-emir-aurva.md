# SSH Доступ — Инструкция для Эмира (aurva.kg)

## 1. Установи Cloudflared

**macOS:**
```bash
brew install cloudflared
```

**Windows:**
Скачай: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/

**Linux:**
```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared
```

---

## 2. Настрой SSH Config

Открой файл `~/.ssh/config` (создай если нет) и добавь:

```
Host ssh.aurva.kg
    HostName ssh.aurva.kg
    User emilbekov
    ProxyCommand cloudflared access ssh --hostname %h
```

---

## 3. Подключение по SSH

```bash
ssh ssh.aurva.kg
```

При первом подключении:
1. Откроется **браузер** → страница входа
2. Войди: `emilbekovemir85@gmail.com` / `AurvaDev2026!`
3. После авторизации вернись в терминал — SSH подключится
4. Пароль SSH: `AurvaSSH2026!`

### Получить root:
```bash
sudo su
```
Root права без пароля ✅

---

## 4. Панели (через браузер)

| Панель | URL | Логин | Пароль |
|--------|-----|-------|--------|
| **Coolify** (деплой) | https://c.aurva.kg | `emilbekovemir85@gmail.com` | `AurvaCool2026!` |
| **Proxmox** (VM) | https://p.aurva.kg | через Keycloak | `AurvaDev2026!` |

> На всех панелях сначала CF Access → вход через Keycloak.

---

## 5. SSH без пароля (по ключу)

Сгенерируй SSH ключ (если нет):
```bash
ssh-keygen -t ed25519 -C "emir@mac"
```

Отправь свой публичный ключ (`~/.ssh/id_ed25519.pub`) администратору для добавления на сервер.

---

## 6. Полезные команды

```bash
# Контейнеры
docker ps

# Логи
docker logs <container> --tail 50

# Диск
df -h

# Память
free -h
```

---

## Проблемы?

| Проблема | Решение |
|----------|---------|
| `cloudflared: command not found` | Установи cloudflared (шаг 1) |
| Браузер не открывается | Скопируй URL из терминала |
| `Permission denied` | Пароль SSH: `AurvaSSH2026!` |
| `Connection refused` | Сервер перезагружается, подожди 2 мин |

---

*Дата: 24 марта 2026*
