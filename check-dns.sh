#!/bin/bash

# AURVA DNS Diagnostics Script
# Проверка состояния DNS на сервере

set -e

echo "======================================"
echo "  AURVA DNS Diagnostics"
echo "  $(date)"
echo "======================================"
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для проверки команды
check_command() {
    if command -v "$1" &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 доступен"
        return 0
    else
        echo -e "${RED}✗${NC} $1 не найден"
        return 1
    fi
}

# Функция для теста DNS
test_dns() {
    local server=$1
    local domain=$2
    local protocol=$3

    echo -n "Тест $protocol DNS ($server → $domain): "

    if [ "$protocol" = "UDP" ]; then
        result=$(dig @"$server" "$domain" +short +time=5 +tries=1 2>&1)
    else
        result=$(dig @"$server" "$domain" +tcp +short +time=5 +tries=1 2>&1)
    fi

    if [ -z "$result" ]; then
        echo -e "${RED}TIMEOUT${NC}"
        return 1
    else
        echo -e "${GREEN}OK${NC} ($result)"
        return 0
    fi
}

# 1. Проверка необходимых команд
echo "1. Проверка доступности команд:"
check_command "dig"
check_command "docker"
check_command "curl"
echo ""

# 2. Проверка UDP DNS на хосте
echo "2. Проверка UDP DNS на хосте:"
test_dns "8.8.8.8" "google.com" "UDP" && UDP_HOST=1 || UDP_HOST=0
test_dns "8.8.4.4" "github.com" "UDP" && UDP_HOST2=1 || UDP_HOST2=0
test_dns "1.1.1.1" "cloudflare.com" "UDP" && UDP_HOST3=1 || UDP_HOST3=0
echo ""

# 3. Проверка TCP DNS на хосте
echo "3. Проверка TCP DNS на хосте:"
test_dns "8.8.8.8" "google.com" "TCP" && TCP_HOST=1 || TCP_HOST=0
test_dns "8.8.4.4" "github.com" "TCP" && TCP_HOST2=1 || TCP_HOST2=0
echo ""

# 4. Проверка DNS в Coolify контейнере
echo "4. Проверка DNS в Coolify контейнере:"
if sudo docker ps | grep -q coolify; then
    echo -n "DNS lookup в Coolify (api.github.com): "
    if sudo docker exec coolify nslookup api.github.com &> /dev/null; then
        echo -e "${GREEN}OK${NC}"
        COOLIFY_DNS=1
    else
        echo -e "${RED}FAILED${NC}"
        COOLIFY_DNS=0
    fi

    echo -n "HTTP запрос в Coolify (api.github.com): "
    if sudo docker exec coolify curl -s --max-time 10 https://api.github.com/zen &> /dev/null; then
        echo -e "${GREEN}OK${NC}"
        COOLIFY_HTTP=1
    else
        echo -e "${RED}FAILED${NC}"
        COOLIFY_HTTP=0
    fi
else
    echo -e "${YELLOW}Coolify контейнер не найден${NC}"
    COOLIFY_DNS=0
    COOLIFY_HTTP=0
fi
echo ""

# 5. Проверка Docker daemon DNS конфигурации
echo "5. Проверка Docker daemon.json:"
if [ -f /etc/docker/daemon.json ]; then
    echo "Содержимое /etc/docker/daemon.json:"
    cat /etc/docker/daemon.json | grep -A 5 "dns" || echo -e "${YELLOW}DNS конфигурация не найдена${NC}"
else
    echo -e "${YELLOW}/etc/docker/daemon.json не существует${NC}"
fi
echo ""

# 6. Проверка сетевых интерфейсов
echo "6. Сетевые интерфейсы:"
ip addr show | grep -E "^[0-9]+:|inet " | head -10
echo ""

# 7. Проверка маршрутизации
echo "7. Таблица маршрутизации:"
ip route | head -5
echo ""

# 8. Проверка /etc/resolv.conf
echo "8. Проверка /etc/resolv.conf:"
cat /etc/resolv.conf
echo ""

# ИТОГИ
echo "======================================"
echo "  ИТОГИ ДИАГНОСТИКИ"
echo "======================================"

# Анализ результатов
if [ $UDP_HOST -eq 1 ] && [ $UDP_HOST2 -eq 1 ]; then
    echo -e "${GREEN}✓ UDP DNS на хосте работает${NC}"
elif [ $TCP_HOST -eq 1 ] && [ $UDP_HOST -eq 0 ]; then
    echo -e "${YELLOW}⚠ UDP DNS не работает, но TCP работает${NC}"
    echo -e "${YELLOW}  → Вероятно, UDP порт 53 блокируется firewall${NC}"
    echo -e "${YELLOW}  → Требуется разблокировка в Proxmox${NC}"
else
    echo -e "${RED}✗ DNS на хосте не работает${NC}"
fi

if [ $COOLIFY_DNS -eq 1 ] && [ $COOLIFY_HTTP -eq 1 ]; then
    echo -e "${GREEN}✓ DNS в Coolify работает${NC}"
    echo -e "${GREEN}  → Можно запускать deploy!${NC}"
elif [ $COOLIFY_DNS -eq 0 ]; then
    echo -e "${RED}✗ DNS в Coolify не работает${NC}"
    echo -e "${RED}  → Deploy через Coolify невозможен${NC}"
    echo -e "${YELLOW}  → Исправьте DNS проблему сначала${NC}"
fi

echo ""
echo "======================================"
echo "  РЕКОМЕНДАЦИИ"
echo "======================================"

if [ $UDP_HOST -eq 0 ] && [ $TCP_HOST -eq 1 ]; then
    echo ""
    echo "ДИАГНОЗ: UDP порт 53 блокируется Proxmox firewall"
    echo ""
    echo "РЕШЕНИЕ:"
    echo "1. Откройте Proxmox Web UI: https://p.aurva.kg"
    echo "2. Выберите VM aurva"
    echo "3. Firewall → Add Rule"
    echo "4. Настройки:"
    echo "   - Direction: OUT"
    echo "   - Action: ACCEPT"
    echo "   - Protocol: UDP"
    echo "   - Dest port: 53"
    echo "5. Нажмите Apply"
    echo ""
    echo "Или через SSH к Proxmox:"
    echo ""
    echo "cat > /etc/pve/firewall/101.fw << 'EOF'"
    echo "[OPTIONS]"
    echo "enable: 1"
    echo ""
    echo "[RULES]"
    echo "OUT ACCEPT -p udp -dport 53 -log nolog"
    echo "EOF"
    echo ""
    echo "pve-firewall restart"
    echo ""
fi

if [ $COOLIFY_DNS -eq 0 ] && [ $UDP_HOST -eq 1 ]; then
    echo ""
    echo "ДИАГНОЗ: DNS работает на хосте, но не в Docker"
    echo ""
    echo "РЕШЕНИЕ: Обновите Docker DNS конфигурацию"
    echo ""
    echo "sudo nano /etc/docker/daemon.json"
    echo ""
    echo "Добавьте:"
    echo '{'
    echo '  "dns": ["8.8.8.8", "8.8.4.4", "1.1.1.1"]'
    echo '}'
    echo ""
    echo "Затем:"
    echo "sudo systemctl restart docker"
    echo "sudo docker restart coolify"
    echo ""
fi

if [ $COOLIFY_DNS -eq 1 ] && [ $COOLIFY_HTTP -eq 1 ]; then
    echo ""
    echo -e "${GREEN}✓ Все проверки пройдены!${NC}"
    echo ""
    echo "СЛЕДУЮЩИЙ ШАГ: Deploy через Coolify"
    echo ""
    echo "1. Откройте: https://c.aurva.kg"
    echo "2. Найдите приложение AURVA"
    echo "3. Нажмите Redeploy"
    echo ""
fi

echo "======================================"
echo ""
