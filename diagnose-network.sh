#!/bin/bash

# Network Diagnostics Script for Coolify Container
# This script diagnoses DNS and network connectivity issues

echo "=========================================="
echo "Coolify Network Diagnostics"
echo "=========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if Coolify container is running
echo "1. Checking Coolify container status..."
if sudo docker ps | grep -q coolify; then
    echo -e "${GREEN}✓ Coolify container is running${NC}"
else
    echo -e "${RED}✗ Coolify container is NOT running${NC}"
    exit 1
fi
echo ""

# Test 2: Check DNS configuration inside Coolify container
echo "2. Checking DNS configuration inside Coolify..."
echo "Contents of /etc/resolv.conf:"
sudo docker exec coolify cat /etc/resolv.conf
echo ""

# Test 3: Test DNS resolution inside Coolify container
echo "3. Testing DNS resolution inside Coolify..."
echo "Testing api.github.com resolution:"
if sudo docker exec coolify nslookup api.github.com 2>&1; then
    echo -e "${GREEN}✓ DNS resolution working${NC}"
else
    echo -e "${RED}✗ DNS resolution FAILED${NC}"
fi
echo ""

echo "Testing google.com resolution:"
if sudo docker exec coolify nslookup google.com 2>&1; then
    echo -e "${GREEN}✓ DNS resolution working${NC}"
else
    echo -e "${RED}✗ DNS resolution FAILED${NC}"
fi
echo ""

# Test 4: Test ping to public DNS servers
echo "4. Testing connectivity to DNS servers..."
echo "Pinging 8.8.8.8 (Google DNS):"
if sudo docker exec coolify ping -c 3 8.8.8.8 2>&1; then
    echo -e "${GREEN}✓ Can reach 8.8.8.8${NC}"
else
    echo -e "${RED}✗ Cannot reach 8.8.8.8${NC}"
fi
echo ""

echo "Pinging 1.1.1.1 (Cloudflare DNS):"
if sudo docker exec coolify ping -c 3 1.1.1.1 2>&1; then
    echo -e "${GREEN}✓ Can reach 1.1.1.1${NC}"
else
    echo -e "${RED}✗ Cannot reach 1.1.1.1${NC}"
fi
echo ""

# Test 5: Test HTTPS connection to GitHub API
echo "5. Testing HTTPS connection to GitHub API..."
echo "Attempting curl to https://api.github.com/zen:"
if sudo docker exec coolify curl -v --max-time 10 https://api.github.com/zen 2>&1; then
    echo -e "${GREEN}✓ GitHub API reachable${NC}"
else
    echo -e "${RED}✗ GitHub API NOT reachable${NC}"
fi
echo ""

# Test 6: Check host's Docker daemon DNS configuration
echo "6. Checking Docker daemon DNS configuration..."
if [ -f /etc/docker/daemon.json ]; then
    echo "Contents of /etc/docker/daemon.json:"
    cat /etc/docker/daemon.json
else
    echo -e "${YELLOW}! /etc/docker/daemon.json does not exist${NC}"
fi
echo ""

# Test 7: Check firewall status
echo "7. Checking firewall status..."
if command -v ufw &> /dev/null; then
    echo "UFW firewall status:"
    sudo ufw status
else
    echo -e "${YELLOW}! UFW not installed${NC}"
fi
echo ""

# Test 8: Check iptables rules
echo "8. Checking iptables rules (OUTPUT chain)..."
sudo iptables -L OUTPUT -n -v --line-numbers | head -20
echo ""

# Test 9: Check Coolify container network settings
echo "9. Checking Coolify container network settings..."
echo "Network configuration:"
sudo docker inspect coolify | grep -A 30 "NetworkSettings"
echo ""

# Test 10: Test DNS from host machine
echo "10. Testing DNS from host machine (for comparison)..."
echo "Host resolution of api.github.com:"
if nslookup api.github.com 2>&1; then
    echo -e "${GREEN}✓ Host DNS resolution working${NC}"
else
    echo -e "${RED}✗ Host DNS resolution FAILED${NC}"
fi
echo ""

echo "Host curl to GitHub API:"
if curl -s --max-time 10 https://api.github.com/zen 2>&1; then
    echo -e "${GREEN}✓ Host can reach GitHub API${NC}"
else
    echo -e "${RED}✗ Host cannot reach GitHub API${NC}"
fi
echo ""

# Summary
echo "=========================================="
echo "Diagnostics Complete"
echo "=========================================="
echo ""
echo "If DNS resolution is failing inside the container but working on the host,"
echo "this indicates a Docker networking configuration issue."
echo ""
echo "Common solutions:"
echo "1. Restart Docker daemon after updating /etc/docker/daemon.json"
echo "2. Recreate Coolify container to pick up new DNS settings"
echo "3. Check firewall rules blocking outbound DNS traffic"
echo "4. Verify network bridge configuration"
