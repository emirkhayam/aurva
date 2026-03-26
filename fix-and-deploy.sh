#!/bin/bash
# AURVA One-Click Fix & Deploy
# Просто скопируйте и вставьте этот скрипт после ssh aurva

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "========================================"
echo "  AURVA One-Click Fix & Deploy"
echo "  $(date)"
echo "========================================"
echo -e "${NC}"
echo ""

# Получить root
echo -e "${YELLOW}[1/8] Получение root прав...${NC}"
sudo su << 'ROOTSCRIPT'

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Проверка DNS
echo ""
echo -e "${YELLOW}[2/8] Проверка DNS...${NC}"
echo ""

echo -n "UDP DNS: "
if timeout 3 dig @8.8.8.8 google.com +short &>/dev/null; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAILED${NC}"
fi

echo -n "TCP DNS: "
if timeout 3 dig @8.8.8.8 google.com +tcp +short &>/dev/null; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAILED${NC}"
fi

echo -n "Docker DNS: "
if docker exec coolify nslookup api.github.com &>/dev/null 2>&1; then
    echo -e "${GREEN}OK${NC}"
    DNS_OK=1
else
    echo -e "${RED}FAILED${NC}"
    DNS_OK=0
fi

# Исправление DNS
if [ $DNS_OK -eq 0 ]; then
    echo ""
    echo -e "${YELLOW}[3/8] Исправление Docker DNS...${NC}"

    cat > /etc/docker/daemon.json << 'EOF'
{
  "dns": ["8.8.8.8", "8.8.4.4", "1.1.1.1"]
}
EOF

    echo -e "${GREEN}✓ daemon.json обновлен${NC}"

    echo ""
    echo -e "${YELLOW}[4/8] Перезапуск Docker...${NC}"
    systemctl restart docker
    echo "Ожидание 5 секунд..."
    sleep 5
    echo -e "${GREEN}✓ Docker перезапущен${NC}"

    echo ""
    echo -e "${YELLOW}[5/8] Перезапуск Coolify...${NC}"
    docker restart coolify
    echo "Ожидание 15 секунд..."
    sleep 15
    echo -e "${GREEN}✓ Coolify перезапущен${NC}"
else
    echo ""
    echo -e "${GREEN}✓ DNS уже работает, пропускаем исправление${NC}"
fi

# Проверка после исправления
echo ""
echo -e "${YELLOW}[6/8] Проверка что DNS работает...${NC}"
echo ""

echo -n "GitHub API: "
if docker exec coolify curl -s --max-time 10 https://api.github.com/zen &>/dev/null; then
    echo -e "${GREEN}OK${NC}"
    echo ""
    docker exec coolify curl -s https://api.github.com/zen
    GITHUB_OK=1
else
    echo -e "${RED}FAILED${NC}"
    GITHUB_OK=0
fi

echo ""

# Статус контейнеров
echo -e "${YELLOW}[7/8] Проверка контейнеров...${NC}"
echo ""
docker ps | head -1
docker ps | grep -E "coolify|aurva" || echo "Контейнеры AURVA пока не запущены"

echo ""

# Итоги
echo -e "${BLUE}"
echo "========================================"
echo "  РЕЗУЛЬТАТ"
echo "========================================"
echo -e "${NC}"

if [ $GITHUB_OK -eq 1 ]; then
    echo -e "${GREEN}✓✓✓ ВСЁ РАБОТАЕТ! ✓✓✓${NC}"
    echo ""
    echo "DNS исправлен, GitHub доступен!"
    echo ""
    echo -e "${YELLOW}СЛЕДУЮЩИЙ ШАГ:${NC}"
    echo ""
    echo "1. Откройте: https://c.aurva.kg"
    echo "2. Логин: emilbekovemir85@gmail.com"
    echo "3. Пароль: AurvaCool2026!"
    echo "4. Добавьте GitHub репозиторий:"
    echo "   → Source → Git → GitHub"
    echo "   → Repository: emirkhayam/aurva"
    echo "   → Branch: master"
    echo "5. Настройте приложение:"
    echo "   → Build Pack: Docker Compose"
    echo "   → Docker Compose Location: docker-compose.yml"
    echo "6. Добавьте Environment Variables (из .env.example)"
    echo "7. Нажмите Deploy!"
    echo ""
else
    echo -e "${RED}⚠ DNS всё ещё не работает${NC}"
    echo ""
    echo "Требуется исправление через Proxmox Firewall:"
    echo ""
    echo "1. Откройте: https://p.aurva.kg"
    echo "2. VM aurva → Firewall → Add Rule"
    echo "3. Direction: OUT, Protocol: UDP, Port: 53"
    echo "4. Запустите этот скрипт снова"
    echo ""
fi

echo -e "${YELLOW}[8/8] Проверка сайта...${NC}"
echo ""
curl -I https://aurva.kg 2>&1 | head -1 || echo "Сайт пока не доступен (это нормально до деплоя)"

echo ""
echo -e "${BLUE}=======================================${NC}"
echo ""

# Полезные команды
echo "Полезные команды для мониторинга:"
echo ""
echo "  # Логи Coolify"
echo "  docker logs coolify --tail 50 -f"
echo ""
echo "  # Все контейнеры"
echo "  docker ps -a"
echo ""
echo "  # Перезапустить Coolify"
echo "  docker restart coolify"
echo ""

ROOTSCRIPT

echo ""
echo -e "${GREEN}Скрипт завершен!${NC}"
echo ""
