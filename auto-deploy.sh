#!/bin/bash

# AURVA Auto Deploy Script
# Автоматическое развертывание после подключения к серверу

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

# ШАГ 1: Проверка DNS
echo -e "${YELLOW}[1/6] Проверка DNS...${NC}"
echo ""

# Проверка UDP DNS
echo -n "UDP DNS (8.8.8.8): "
if timeout 5 dig @8.8.8.8 google.com +short +tries=1 &> /dev/null; then
    echo -e "${GREEN}OK${NC}"
    UDP_WORKS=1
else
    echo -e "${RED}FAILED${NC}"
    UDP_WORKS=0
fi

# Проверка TCP DNS
echo -n "TCP DNS (8.8.8.8): "
if timeout 5 dig @8.8.8.8 google.com +tcp +short +tries=1 &> /dev/null; then
    echo -e "${GREEN}OK${NC}"
    TCP_WORKS=1
else
    echo -e "${RED}FAILED${NC}"
    TCP_WORKS=0
fi

# Проверка DNS в Docker
echo -n "DNS в Coolify: "
if sudo docker ps | grep -q coolify; then
    if sudo docker exec coolify nslookup api.github.com &> /dev/null; then
        echo -e "${GREEN}OK${NC}"
        DOCKER_DNS_WORKS=1
    else
        echo -e "${RED}FAILED${NC}"
        DOCKER_DNS_WORKS=0
    fi
else
    echo -e "${YELLOW}Coolify не запущен${NC}"
    DOCKER_DNS_WORKS=0
fi

echo ""

# Анализ результатов DNS
if [ $UDP_WORKS -eq 0 ] && [ $TCP_WORKS -eq 1 ]; then
    echo -e "${RED}⚠ ПРОБЛЕМА: UDP DNS не работает!${NC}"
    echo ""
    echo "Необходимо исправить через Proxmox:"
    echo ""
    echo "1. Откройте: https://p.aurva.kg"
    echo "2. Войдите через CF Access + Keycloak"
    echo "3. VM aurva → Firewall → Add Rule:"
    echo "   - Direction: OUT"
    echo "   - Protocol: UDP"
    echo "   - Dest port: 53"
    echo "   - Action: ACCEPT"
    echo "4. Нажмите Apply"
    echo ""
    echo -e "${YELLOW}После исправления запустите этот скрипт снова.${NC}"
    echo ""
    exit 1
fi

if [ $DOCKER_DNS_WORKS -eq 0 ] && [ $UDP_WORKS -eq 1 ]; then
    echo -e "${YELLOW}⚠ DNS работает на хосте, но не в Docker${NC}"
    echo ""
    echo "Обновляю Docker DNS конфигурацию..."

    # Обновление Docker daemon.json
    sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "dns": ["8.8.8.8", "8.8.4.4", "1.1.1.1"]
}
EOF

    echo "Перезапуск Docker..."
    sudo systemctl restart docker

    echo "Ожидание запуска Docker..."
    sleep 5

    echo "Перезапуск Coolify..."
    sudo docker restart coolify

    echo "Ожидание запуска Coolify..."
    sleep 10

    echo -e "${GREEN}✓ Docker DNS обновлен${NC}"
    echo ""

    # Повторная проверка
    echo "Повторная проверка DNS в Docker..."
    if sudo docker exec coolify nslookup api.github.com &> /dev/null; then
        echo -e "${GREEN}✓ DNS в Docker работает!${NC}"
        DOCKER_DNS_WORKS=1
    else
        echo -e "${RED}✗ DNS все еще не работает${NC}"
        echo "Требуется ручная диагностика."
        exit 1
    fi
fi

echo -e "${GREEN}✓ DNS проверки пройдены${NC}"
echo ""

# ШАГ 2: Проверка GitHub API доступности
echo -e "${YELLOW}[2/6] Проверка доступа к GitHub API...${NC}"
echo ""

if sudo docker exec coolify curl -s --max-time 10 https://api.github.com/zen &> /dev/null; then
    echo -e "${GREEN}✓ GitHub API доступен${NC}"
else
    echo -e "${RED}✗ GitHub API недоступен${NC}"
    echo "Проблема с сетью. Проверьте DNS и firewall."
    exit 1
fi
echo ""

# ШАГ 3: Проверка репозитория
echo -e "${YELLOW}[3/6] Проверка репозитория AURVA...${NC}"
echo ""

REPO_URL="https://github.com/emirkhayam/aurva.git"
if git ls-remote "$REPO_URL" &> /dev/null; then
    echo -e "${GREEN}✓ Репозиторий доступен${NC}"
else
    echo -e "${RED}✗ Репозиторий недоступен${NC}"
    exit 1
fi
echo ""

# ШАГ 4: Проверка Coolify
echo -e "${YELLOW}[4/6] Проверка Coolify...${NC}"
echo ""

if sudo docker ps | grep -q coolify; then
    echo -e "${GREEN}✓ Coolify запущен${NC}"

    # Проверка логов Coolify
    echo ""
    echo "Последние логи Coolify:"
    sudo docker logs coolify --tail 10
else
    echo -e "${RED}✗ Coolify не запущен${NC}"
    echo "Запускаю Coolify..."
    sudo docker start coolify
    sleep 10
fi
echo ""

# ШАГ 5: Информация о деплое
echo -e "${YELLOW}[5/6] Подготовка к deploy...${NC}"
echo ""

echo "Для запуска deploy выполните одно из действий:"
echo ""
echo "Вариант 1 - Через Web UI (рекомендуется):"
echo "  1. Откройте: https://c.aurva.kg"
echo "  2. Логин: emilbekovemir85@gmail.com"
echo "  3. Пароль: AurvaCool2026!"
echo "  4. Найдите проект AURVA"
echo "  5. Нажмите 'Redeploy' или 'Force Redeploy'"
echo ""

echo "Вариант 2 - Через Docker Compose (альтернатива):"
echo "  Если Coolify не работает, можно развернуть напрямую:"
echo ""
echo "  cd /opt"
echo "  sudo git clone https://github.com/emirkhayam/aurva.git"
echo "  cd aurva"
echo "  sudo cp .env.example .env"
echo "  sudo nano .env  # Заполните переменные Supabase"
echo "  sudo docker compose up -d"
echo ""

# ШАГ 6: Проверка текущего состояния
echo -e "${YELLOW}[6/6] Проверка текущего состояния...${NC}"
echo ""

echo "Запущенные контейнеры AURVA:"
sudo docker ps | grep -E "aurva|CONTAINER" || echo "Контейнеры AURVA не найдены"
echo ""

echo "Проверка доступности сайта:"
if curl -s -I -m 10 https://aurva.kg | head -1; then
    echo -e "${GREEN}✓ Сайт отвечает${NC}"
else
    echo -e "${YELLOW}⚠ Сайт пока не доступен (это нормально до деплоя)${NC}"
fi
echo ""

# Итоги
echo -e "${BLUE}======================================"
echo "  ИТОГИ"
echo "======================================${NC}"
echo ""

if [ $UDP_WORKS -eq 1 ] && [ $DOCKER_DNS_WORKS -eq 1 ]; then
    echo -e "${GREEN}✓ Все проверки пройдены!${NC}"
    echo ""
    echo "ГОТОВО К DEPLOY!"
    echo ""
    echo "Следующий шаг:"
    echo "  → Откройте https://c.aurva.kg"
    echo "  → Запустите Redeploy для проекта AURVA"
    echo ""
else
    echo -e "${YELLOW}⚠ Требуются дополнительные действия${NC}"
    echo ""
    echo "Проверьте вывод выше для деталей."
    echo ""
fi

echo -e "${BLUE}======================================${NC}"
echo ""

# Дополнительные команды для проверки
echo "Полезные команды для мониторинга деплоя:"
echo ""
echo "  # Логи Coolify в реальном времени"
echo "  sudo docker logs -f coolify"
echo ""
echo "  # Логи всех контейнеров AURVA"
echo "  sudo docker ps | grep aurva | awk '{print \$1}' | xargs -I {} sudo docker logs {} --tail 50"
echo ""
echo "  # Статус всех контейнеров"
echo "  sudo docker ps -a"
echo ""
echo "  # Использование диска"
echo "  df -h"
echo ""
echo "  # Проверка сайта"
echo "  curl -I https://aurva.kg"
echo ""
