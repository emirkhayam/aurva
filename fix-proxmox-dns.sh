#!/bin/bash

# AURVA - Proxmox Firewall DNS Fix Script
# Исправление блокировки UDP порт 53 в Proxmox

set -e

echo "======================================"
echo "  AURVA Proxmox DNS Fix"
echo "  $(date)"
echo "======================================"
echo ""

# Цвета
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Проверка что скрипт запущен на Proxmox хосте
if ! command -v pve-firewall &> /dev/null; then
    echo -e "${RED}✗ Ошибка: Этот скрипт должен быть запущен на Proxmox хосте${NC}"
    echo ""
    echo "Если вы на сервере aurva, подключитесь к Proxmox:"
    echo ""
    echo "  ssh root@p.aurva.kg"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Proxmox обнаружен${NC}"
echo ""

# Поиск VM aurva
echo "1. Поиск VM aurva..."
VM_ID=$(qm list | grep -i aurva | awk '{print $1}' | head -1)

if [ -z "$VM_ID" ]; then
    echo -e "${RED}✗ VM 'aurva' не найдена${NC}"
    echo ""
    echo "Доступные VM:"
    qm list
    echo ""
    read -p "Введите ID VM aurva вручную: " VM_ID
fi

echo -e "${GREEN}✓ Найдена VM aurva (ID: $VM_ID)${NC}"
echo ""

# Создание backup текущей конфигурации firewall
FW_FILE="/etc/pve/firewall/${VM_ID}.fw"
if [ -f "$FW_FILE" ]; then
    echo "2. Создание backup текущей конфигурации..."
    cp "$FW_FILE" "${FW_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${GREEN}✓ Backup создан${NC}"
else
    echo "2. Текущей конфигурации firewall нет, создаем новую..."
fi
echo ""

# Создание новой конфигурации firewall
echo "3. Создание firewall правил для DNS..."

cat > "$FW_FILE" << 'EOF'
[OPTIONS]
enable: 1

[RULES]
# Allow DNS queries (UDP and TCP)
OUT ACCEPT -p udp -dport 53 -log nolog # DNS over UDP
OUT ACCEPT -p tcp -dport 53 -log nolog # DNS over TCP

# Allow HTTPS (для GitHub API, Coolify, etc)
OUT ACCEPT -p tcp -dport 443 -log nolog # HTTPS

# Allow HTTP (для internal communication)
OUT ACCEPT -p tcp -dport 80 -log nolog # HTTP

# Allow established connections
OUT ACCEPT -m state --state ESTABLISHED,RELATED -log nolog
EOF

echo -e "${GREEN}✓ Firewall конфигурация создана${NC}"
echo ""

# Показать созданную конфигурацию
echo "4. Созданная конфигурация:"
echo "---"
cat "$FW_FILE"
echo "---"
echo ""

# Применение изменений
echo "5. Применение firewall правил..."
pve-firewall restart

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Firewall перезапущен успешно${NC}"
else
    echo -e "${RED}✗ Ошибка при перезапуске firewall${NC}"
    echo ""
    echo "Восстановление из backup..."
    if [ -f "${FW_FILE}.backup."* ]; then
        cp "${FW_FILE}.backup."* "$FW_FILE"
        pve-firewall restart
        echo -e "${YELLOW}Конфигурация восстановлена из backup${NC}"
    fi
    exit 1
fi
echo ""

# Проверка статуса firewall
echo "6. Проверка статуса firewall..."
pve-firewall status
echo ""

# Проверка правил для конкретной VM
echo "7. Правила для VM $VM_ID:"
pve-firewall compile "$VM_ID" | grep -A 20 "OUTPUT" || echo "Правила применяются..."
echo ""

echo "======================================"
echo -e "${GREEN}  ИСПРАВЛЕНИЕ ЗАВЕРШЕНО${NC}"
echo "======================================"
echo ""
echo "СЛЕДУЮЩИЕ ШАГИ:"
echo ""
echo "1. Подключитесь к серверу aurva:"
echo "   ssh aurva"
echo ""
echo "2. Проверьте что DNS работает:"
echo "   dig @8.8.8.8 google.com +short"
echo ""
echo "3. Проверьте DNS в Docker:"
echo "   sudo docker exec coolify nslookup api.github.com"
echo ""
echo "4. Запустите полную диагностику:"
echo "   bash check-dns.sh"
echo ""
echo "5. Если все работает - запустите deploy в Coolify:"
echo "   https://c.aurva.kg"
echo ""
echo "======================================"
echo ""

# Опционально: автоматическая проверка на aurva VM
read -p "Выполнить автоматическую проверку DNS на VM aurva? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Проверка DNS на VM aurva..."

    # Получить IP адрес VM
    VM_IP=$(qm guest cmd "$VM_ID" network-get-interfaces 2>/dev/null | grep -oP '(?<="ip-address":")[^"]*' | grep -v "127.0.0.1" | head -1)

    if [ -n "$VM_IP" ]; then
        echo "IP адрес VM: $VM_IP"
        echo ""
        echo "Подключение к VM и проверка DNS..."

        # Попытка SSH подключения
        if command -v sshpass &> /dev/null; then
            ssh -o StrictHostKeyChecking=no "root@$VM_IP" "dig @8.8.8.8 google.com +short +time=5" 2>/dev/null && \
                echo -e "${GREEN}✓ UDP DNS работает на VM!${NC}" || \
                echo -e "${YELLOW}⚠ UDP DNS все еще не работает. Попробуйте перезагрузить VM.${NC}"
        else
            echo "Выполните проверку вручную:"
            echo "  ssh root@$VM_IP"
            echo "  dig @8.8.8.8 google.com +short"
        fi
    else
        echo -e "${YELLOW}Не удалось получить IP адрес VM${NC}"
        echo "Выполните проверку вручную через SSH"
    fi
fi

echo ""
echo "Готово!"
echo ""
