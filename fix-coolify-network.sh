#!/bin/bash

# Coolify Network Fix Script
# This script attempts to fix DNS and network issues with Coolify

set -e

echo "=========================================="
echo "Coolify Network Fix Script"
echo "=========================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Update Docker daemon DNS configuration
echo "Step 1: Updating Docker daemon DNS configuration..."
sudo mkdir -p /etc/docker

# Backup existing daemon.json if it exists
if [ -f /etc/docker/daemon.json ]; then
    echo "Backing up existing daemon.json..."
    sudo cp /etc/docker/daemon.json /etc/docker/daemon.json.backup.$(date +%Y%m%d%H%M%S)
fi

# Create or update daemon.json with DNS settings
echo "Creating new daemon.json with DNS servers..."
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "dns": ["8.8.8.8", "8.8.4.4", "1.1.1.1"],
  "dns-opts": ["ndots:0"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

echo -e "${GREEN}✓ Docker daemon configuration updated${NC}"
echo ""

# Step 2: Restart Docker daemon
echo "Step 2: Restarting Docker daemon..."
sudo systemctl restart docker
sleep 5

if sudo systemctl is-active --quiet docker; then
    echo -e "${GREEN}✓ Docker daemon restarted successfully${NC}"
else
    echo -e "${RED}✗ Docker daemon failed to restart${NC}"
    exit 1
fi
echo ""

# Step 3: Stop and remove Coolify container
echo "Step 3: Recreating Coolify container to pick up new DNS settings..."
echo "Stopping Coolify container..."
sudo docker stop coolify 2>/dev/null || echo "Coolify not running"
echo ""

echo "Removing Coolify container..."
sudo docker rm coolify 2>/dev/null || echo "Coolify container not found"
echo ""

# Step 4: Get the Coolify image
echo "Step 4: Pulling latest Coolify image..."
sudo docker pull ghcr.io/coollabsio/coolify:latest
echo ""

# Step 5: Recreate Coolify container with proper DNS
echo "Step 5: Starting Coolify with new configuration..."
sudo docker run -d \
  --name coolify \
  --restart unless-stopped \
  --dns 8.8.8.8 \
  --dns 8.8.4.4 \
  --dns 1.1.1.1 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v coolify-db:/var/lib/postgresql/data \
  -v coolify-data:/data \
  --network coolify \
  -p 8000:8000 \
  ghcr.io/coollabsio/coolify:latest

echo ""
echo "Waiting for Coolify to start (30 seconds)..."
sleep 30

if sudo docker ps | grep -q coolify; then
    echo -e "${GREEN}✓ Coolify container started successfully${NC}"
else
    echo -e "${RED}✗ Coolify container failed to start${NC}"
    echo "Check logs with: sudo docker logs coolify"
    exit 1
fi
echo ""

# Step 6: Test DNS inside new Coolify container
echo "Step 6: Testing DNS resolution in new Coolify container..."
echo "Testing api.github.com:"
if sudo docker exec coolify nslookup api.github.com 2>&1 | grep -q "Address"; then
    echo -e "${GREEN}✓ DNS resolution working!${NC}"
else
    echo -e "${RED}✗ DNS resolution still failing${NC}"
    echo "Showing resolv.conf:"
    sudo docker exec coolify cat /etc/resolv.conf
fi
echo ""

echo "Testing GitHub API connectivity:"
if sudo docker exec coolify curl -s --max-time 10 https://api.github.com/zen 2>&1; then
    echo -e "${GREEN}✓ GitHub API reachable!${NC}"
else
    echo -e "${YELLOW}! GitHub API still unreachable${NC}"
    echo "This might be a firewall issue. See manual fixes below."
fi
echo ""

# Step 7: Summary and next steps
echo "=========================================="
echo "Fix Complete"
echo "=========================================="
echo ""
echo -e "${GREEN}If DNS is now working:${NC}"
echo "1. Navigate to Coolify UI: https://coolify.aurva.kg"
echo "2. Re-deploy your application"
echo "3. Monitor deployment logs"
echo ""
echo -e "${YELLOW}If DNS is still failing:${NC}"
echo "1. Check firewall rules: sudo ufw status"
echo "2. Check if outbound traffic is blocked"
echo "3. Try manual deployment (see NETWORK_SOLUTIONS.md)"
echo ""
echo "Run diagnostics again: bash diagnose-network.sh"
