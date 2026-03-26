# Запустить развертывание AURVA

## Шаг 1: Откройте терминал и подключитесь

```bash
ssh aurva
```

**При первом подключении:**
- Откроется браузер
- Войдите: `emilbekovemir85@gmail.com` / `AurvaDev2026!`
- Вернитесь в терминал

**Если попросит пароль SSH:** `AurvaSSH2026!`

---

## Шаг 2: Скопируйте и вставьте этот скрипт

После подключения к серверу скопируйте и вставьте весь блок:

```bash
# Создание и запуск скрипта автоматического развертывания
cat > auto-deploy.sh << 'SCRIPT_END'
#!/bin/bash

# AURVA Auto Deploy Script
set -e

# Цвета
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================"
echo "  AURVA Auto Deploy"
echo "  $(date)"
echo "======================================${NC}"
echo ""

# Проверка DNS
echo -e "${YELLOW}[1/6] Проверка DNS...${NC}"
echo ""

echo -n "UDP DNS: "
if timeout 5 dig @8.8.8.8 google.com +short &> /dev/null; then
    echo -e "${GREEN}OK${NC}"
    UDP_OK=1
else
    echo -e "${RED}FAILED${NC}"
    UDP_OK=0
fi

echo -n "TCP DNS: "
if timeout 5 dig @8.8.8.8 google.com +tcp +short &> /dev/null; then
    echo -e "${GREEN}OK${NC}"
    TCP_OK=1
else
    echo -e "${RED}FAILED${NC}"
    TCP_OK=0
fi

echo -n "Docker DNS: "
if sudo docker exec coolify nslookup api.github.com &> /dev/null 2>&1; then
    echo -e "${GREEN}OK${NC}"
    DOCKER_OK=1
else
    echo -e "${RED}FAILED${NC}"
    DOCKER_OK=0
fi

echo ""

# Исправление DNS если нужно
if [ $UDP_OK -eq 0 ] && [ $TCP_OK -eq 1 ]; then
    echo -e "${RED}UDP DNS блокируется!${NC}"
    echo ""
    echo "ИСПРАВЛЕНИЕ:"
    echo "1. Откройте: https://p.aurva.kg"
    echo "2. VM aurva → Firewall → Add Rule"
    echo "3. Direction: OUT, Protocol: UDP, Port: 53"
    echo ""
    echo "Затем запустите скрипт снова."
    exit 1
fi

if [ $DOCKER_OK -eq 0 ] && [ $UDP_OK -eq 1 ]; then
    echo "Обновление Docker DNS..."
    sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "dns": ["8.8.8.8", "8.8.4.4", "1.1.1.1"]
}
EOF
    sudo systemctl restart docker
    sleep 5
    sudo docker restart coolify
    sleep 10
    echo -e "${GREEN}DNS обновлен${NC}"
fi

# Проверка GitHub
echo -e "${YELLOW}[2/6] Проверка GitHub API...${NC}"
if sudo docker exec coolify curl -s --max-time 10 https://api.github.com/zen &> /dev/null; then
    echo -e "${GREEN}✓ GitHub доступен${NC}"
else
    echo -e "${RED}✗ GitHub недоступен${NC}"
    exit 1
fi
echo ""

# Проверка Coolify
echo -e "${YELLOW}[3/6] Проверка Coolify...${NC}"
if sudo docker ps | grep -q coolify; then
    echo -e "${GREEN}✓ Coolify работает${NC}"
else
    echo -e "${RED}✗ Coolify не запущен${NC}"
    sudo docker start coolify
    sleep 10
fi
echo ""

# Проверка контейнеров
echo -e "${YELLOW}[4/6] Текущие контейнеры AURVA:${NC}"
sudo docker ps | grep aurva || echo "Контейнеры пока не запущены"
echo ""

# Проверка сайта
echo -e "${YELLOW}[5/6] Проверка сайта...${NC}"
curl -I https://aurva.kg 2>&1 | head -1 || echo "Сайт пока не доступен"
echo ""

# Итоги
echo -e "${BLUE}======================================"
echo "  ГОТОВО К DEPLOY"
echo "======================================${NC}"
echo ""
echo "СЛЕДУЮЩИЙ ШАГ:"
echo ""
echo "  1. Откройте: https://c.aurva.kg"
echo "  2. Логин: emilbekovemir85@gmail.com"
echo "  3. Пароль: AurvaCool2026!"
echo "  4. Найдите проект AURVA"
echo "  5. Нажмите 'Redeploy'"
echo ""
echo -e "${GREEN}Или используйте альтернативный метод:${NC}"
echo ""
echo "  cd /opt"
echo "  sudo git clone https://github.com/emirkhayam/aurva.git"
echo "  cd aurva"
echo "  sudo cp .env.example .env"
echo "  # Заполните .env"
echo "  sudo docker compose up -d"
echo ""

SCRIPT_END

chmod +x auto-deploy.sh
./auto-deploy.sh
```

---

## Шаг 3: Следуйте инструкциям скрипта

Скрипт автоматически:
- ✅ Проверит DNS
- ✅ Исправит DNS если нужно
- ✅ Проверит доступ к GitHub
- ✅ Проверит Coolify
- ✅ Покажет текущий статус

---

## Шаг 4: Запустите deploy в Coolify

После успешной проверки:

1. Откройте: **https://c.aurva.kg**
2. Логин: `emilbekovemir85@gmail.com`
3. Пароль: `AurvaCool2026!`
4. Найдите проект **AURVA**
5. Нажмите **Redeploy** или **Force Redeploy**

---

## Шаг 5: Проверьте результат

```bash
# На сервере aurva
sudo docker ps | grep aurva

# Проверьте сайт
curl -I https://aurva.kg

# Откройте в браузере
# https://aurva.kg
```

---

## Если что-то не работает

### DNS не работает после скрипта?

Откройте Proxmox:
- URL: https://p.aurva.kg
- VM aurva → Firewall → Add Rule
- Direction: OUT, Protocol: UDP, Port: 53, Action: ACCEPT

### Coolify недоступен?

```bash
ssh aurva
sudo docker ps | grep coolify
sudo docker logs coolify --tail 50
sudo docker restart coolify
```

### Deploy падает с ошибкой?

Проверьте переменные окружения в Coolify:
- Settings → Environment Variables
- Убедитесь что все Supabase переменные заполнены

---

## Альтернативный метод (Docker Compose)

Если Coolify не работает:

```bash
ssh aurva

cd /opt
sudo git clone https://github.com/emirkhayam/aurva.git
cd aurva

# Создайте .env из примера
sudo cp .env.example .env
sudo nano .env

# Заполните переменные:
# POSTGRES_USER=...
# POSTGRES_PASSWORD=...
# POSTGRES_DB=...
# DATABASE_URL=...
# и т.д.

# Запустите
sudo docker compose up -d

# Проверьте
sudo docker compose logs -f
```

---

## Контакты

- Email: aurva.kg@gmail.com
- Телефон: +996 550 99 90 10

---

**Удачи!** Скрипт сделает всё автоматически.
