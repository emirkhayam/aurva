# Исправление DNS: Разблокировка UDP порта 53 в Proxmox

## Проблема

**КОРНЕВАЯ ПРИЧИНА НАЙДЕНА:**
- UDP порт 53 (DNS) **блокируется** Proxmox firewall или upstream firewall
- TCP порт 53 работает ✓
- ICMP (ping) работает ✓
- Это приводит к timeout при DNS запросах

## Доказательства

### Тест с хоста aurva:
```bash
# UDP DNS - НЕ РАБОТАЕТ
$ dig @8.8.8.8 google.com +short
;; communications error to 8.8.8.8#53: timed out

# TCP DNS - РАБОТАЕТ
$ dig @8.8.8.8 google.com +tcp +short
142.251.38.78
```

### Логи Docker daemon показывают:
```
[resolver] failed to query external DNS server
error="read udp 10.0.1.2:48010->8.8.4.4:53: i/o timeout"
```

## Решение: Разблокировать UDP 53 в Proxmox

### Вариант 1: Через Proxmox Web UI (РЕКОМЕНДУЕТСЯ)

1. **Подключитесь к Proxmox Web UI:**
   - Откройте: https://135.181.112.60:8006
   - Войдите как root или администратор

2. **Перейдите к настройкам firewall VM aurva:**
   - В левом меню выберите VM `aurva` (ID: 101)
   - Перейдите в `Firewall` → `Options`

3. **Включите Firewall если выключен:**
   - Firewall: `Enabled: Yes`

4. **Добавьте правило для исходящего DNS:**
   - Перейдите в `Firewall` → `Add`
   - Создайте новое правило:
     ```
     Direction: OUT
     Action: ACCEPT
     Protocol: udp
     Destination port: 53
     Comment: Allow DNS queries
     ```

5. **Примените изменения:**
   - Нажмите `Add`
   - Правило применится автоматически

### Вариант 2: Через SSH к Proxmox (быстрее)

```bash
# Подключиться к Proxmox
ssh proxmox

# Проверить текущие правила firewall для VM 101 (aurva)
cat /etc/pve/firewall/101.fw

# Добавить правило для исходящего UDP DNS
cat >> /etc/pve/firewall/101.fw <<EOF
[RULES]
OUT ACCEPT -p udp -dport 53 -log nolog # Allow DNS queries
EOF

# Перезапустить firewall
pve-firewall restart
```

### Вариант 3: Отключить Proxmox firewall для VM (не рекомендуется)

```bash
ssh proxmox "qm set 101 --firewall 0"
```

## Проверка после исправления

### 1. Проверить с хоста aurva:
```bash
ssh aurva "dig @8.8.8.8 google.com +short"
```

Ожидаемый результат: IP адрес (например: `142.251.38.78`)

### 2. Проверить в контейнере Coolify:
```bash
ssh aurva "sudo docker exec coolify nslookup api.github.com"
```

Ожидаемый результат:
```
Server:		127.0.0.11
Address:	127.0.0.11#53

Non-authoritative answer:
Name:	api.github.com
Address: 140.82.121.5
```

### 3. Проверить GitHub API:
```bash
ssh aurva "sudo docker exec coolify curl https://api.github.com/zen"
```

Ожидаемый результат: Цитата от GitHub (например: "Design for failure.")

## После успешного исправления

1. **Откройте Coolify UI:**
   https://coolify.aurva.kg

2. **Запустите redeploy:**
   - Перейдите к приложению AURVA
   - Нажмите "Redeploy"
   - Следите за логами

3. **Проверьте сайт:**
   ```bash
   curl -I https://aurva.kg
   ```

   Ожидаемый результат: `HTTP/2 200`

## Альтернативное решение (если нет доступа к Proxmox)

Если у вас нет доступа к Proxmox firewall, используйте **альтернативное развертывание**:

### Развертывание через Docker Compose (без Coolify)

См. файл `NETWORK_SOLUTIONS.md` → Решение 4

Этот метод:
- Не требует Coolify
- Не использует GitHub API
- Работает с локальным репозиторием

## Техническая информация

### Почему блокируется именно UDP 53?

Многие ISP и корпоративные firewall блокируют UDP DNS (порт 53) для:
- Защиты от DNS amplification атак
- Принуждения использовать корпоративные DNS серверы
- Контроля DNS трафика

### Почему TCP 53 работает?

TCP DNS обычно не блокируется так как:
- Не используется для amplification атак
- Требует установки соединения
- Легче отслеживать

### Почему ping работает?

ICMP (ping) использует другой протокол (не UDP), поэтому не затронут блокировкой порта 53.

## Контакты поддержки

Если после разблокировки UDP 53 проблема остается:
1. Проверьте логи: `ssh aurva "sudo journalctl -u docker.service --no-pager | tail -50"`
2. Запустите диагностику: `ssh aurva "bash ~/diagnose-network.sh"`
3. Обратитесь к `NETWORK_SOLUTIONS.md` для альтернативных решений

---

**Время выполнения:** 2-5 минут
**Уровень сложности:** Легкий (требует доступ к Proxmox)
**Последнее обновление:** 2026-03-06

---

## Краткая инструкция (TL;DR)

```bash
# На Proxmox хосте
ssh proxmox
cat >> /etc/pve/firewall/101.fw <<EOF
[RULES]
OUT ACCEPT -p udp -dport 53 -log nolog
EOF
pve-firewall restart

# Проверка на aurva
ssh aurva "dig @8.8.8.8 google.com +short"
# Должен вернуть IP адрес

# Если работает - запустить redeploy в Coolify UI
```
