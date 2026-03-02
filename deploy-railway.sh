#!/bin/bash

# AURVA Railway Automated Deployment Script
# Этот скрипт автоматизирует весь процесс деплоя на Railway

set -e  # Exit on error

echo "🚂 AURVA Railway Deployment Script"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if Railway CLI is installed
echo -e "${BLUE}[1/8] Checking Railway CLI...${NC}"
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}Railway CLI not found. Installing...${NC}"
    npm install -g @railway/cli
    echo -e "${GREEN}✓ Railway CLI installed${NC}"
else
    echo -e "${GREEN}✓ Railway CLI already installed${NC}"
fi
echo ""

# Step 2: Login to Railway
echo -e "${BLUE}[2/8] Logging into Railway...${NC}"
echo -e "${YELLOW}This will open your browser for authentication${NC}"
railway login
echo -e "${GREEN}✓ Logged in successfully${NC}"
echo ""

# Step 3: Create new project
echo -e "${BLUE}[3/8] Creating Railway project...${NC}"
cd backend
railway init
echo -e "${GREEN}✓ Project created${NC}"
echo ""

# Step 4: Add PostgreSQL
echo -e "${BLUE}[4/8] Adding PostgreSQL database...${NC}"
railway add --plugin postgresql
echo -e "${GREEN}✓ PostgreSQL added${NC}"
echo ""

# Step 5: Set environment variables
echo -e "${BLUE}[5/8] Setting environment variables...${NC}"

# Generate JWT_SECRET if not provided
JWT_SECRET=${JWT_SECRET:-$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")}

echo -e "${YELLOW}Setting variables...${NC}"
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=$JWT_SECRET
railway variables set JWT_EXPIRES_IN=7d
railway variables set CORS_ORIGIN="*"
railway variables set EMAIL_HOST=smtp.gmail.com
railway variables set EMAIL_PORT=587
railway variables set EMAIL_SECURE=false
railway variables set MAX_FILE_SIZE=5242880
railway variables set UPLOAD_PATH=/app/uploads

# Prompt for sensitive data
echo ""
echo -e "${YELLOW}Please provide the following sensitive information:${NC}"
read -p "Gmail address (e.g., aurva.kg@gmail.com): " EMAIL_USER
read -sp "Gmail App Password: " EMAIL_PASSWORD
echo ""
read -p "Admin email: " ADMIN_EMAIL
read -sp "Admin password: " ADMIN_PASSWORD
echo ""

railway variables set EMAIL_USER=$EMAIL_USER
railway variables set EMAIL_PASSWORD=$EMAIL_PASSWORD
railway variables set EMAIL_FROM=$EMAIL_USER
railway variables set ADMIN_EMAIL=$ADMIN_EMAIL
railway variables set ADMIN_PASSWORD=$ADMIN_PASSWORD

# Use Railway's PostgreSQL
railway variables set DATABASE_URL='${{Postgres.DATABASE_URL}}'

echo -e "${GREEN}✓ Environment variables set${NC}"
echo ""

# Step 6: Add persistent volume
echo -e "${BLUE}[6/8] Adding persistent volume for uploads...${NC}"
railway volume create uploads-volume --mount /app/uploads
echo -e "${GREEN}✓ Volume created and mounted at /app/uploads${NC}"
echo ""

# Step 7: Deploy
echo -e "${BLUE}[7/8] Deploying to Railway...${NC}"
railway up
echo -e "${GREEN}✓ Deployment started${NC}"
echo ""

# Step 8: Generate domain
echo -e "${BLUE}[8/8] Generating public domain...${NC}"
railway domain
echo -e "${GREEN}✓ Domain generated${NC}"
echo ""

# Get deployment info
echo ""
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo -e "${BLUE}Your API is being deployed...${NC}"
echo ""
echo "To check deployment status:"
echo "  railway status"
echo ""
echo "To view logs:"
echo "  railway logs"
echo ""
echo "To open dashboard:"
echo "  railway open"
echo ""
echo -e "${YELLOW}Note: Initial build may take 3-5 minutes${NC}"
echo ""
echo "Your JWT_SECRET (save this securely):"
echo -e "${GREEN}$JWT_SECRET${NC}"
echo ""
