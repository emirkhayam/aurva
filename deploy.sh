#!/bin/bash

###############################################################################
# AURVA Deployment Script for c.aurva.kg
# This script automates the deployment process
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="aurva"
DOMAIN="c.aurva.kg"
COMPOSE_FILE="docker-compose.production.yml"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  AURVA Deployment Script              ║${NC}"
echo -e "${BLUE}║  Target: ${DOMAIN}                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

###############################################################################
# Check if .env file exists
###############################################################################
check_env_file() {
    echo -e "${YELLOW}[1/7]${NC} Checking environment configuration..."

    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚠️  .env file not found!${NC}"

        if [ -f ".env.production" ]; then
            echo -e "${GREEN}✓${NC} Found .env.production, copying to .env..."
            cp .env.production .env
        else
            echo -e "${RED}✗${NC} No environment file found!"
            echo -e "${YELLOW}Please create .env file from .env.production.example${NC}"
            exit 1
        fi
    fi

    echo -e "${GREEN}✓${NC} Environment configuration found"
}

###############################################################################
# Check if Docker is installed
###############################################################################
check_docker() {
    echo -e "${YELLOW}[2/7]${NC} Checking Docker installation..."

    if ! command -v docker &> /dev/null; then
        echo -e "${RED}✗${NC} Docker is not installed!"
        echo -e "${YELLOW}Please install Docker first: https://get.docker.com${NC}"
        exit 1
    fi

    if ! docker compose version &> /dev/null; then
        echo -e "${RED}✗${NC} Docker Compose is not installed!"
        exit 1
    fi

    echo -e "${GREEN}✓${NC} Docker and Docker Compose are installed"
}

###############################################################################
# Stop existing containers
###############################################################################
stop_containers() {
    echo -e "${YELLOW}[3/7]${NC} Stopping existing containers..."

    if docker compose -f $COMPOSE_FILE ps -q 2>/dev/null | grep -q .; then
        docker compose -f $COMPOSE_FILE down
        echo -e "${GREEN}✓${NC} Existing containers stopped"
    else
        echo -e "${GREEN}✓${NC} No existing containers found"
    fi
}

###############################################################################
# Build Docker images
###############################################################################
build_images() {
    echo -e "${YELLOW}[4/7]${NC} Building Docker images..."

    docker compose -f $COMPOSE_FILE build --no-cache

    echo -e "${GREEN}✓${NC} Docker images built successfully"
}

###############################################################################
# Start containers
###############################################################################
start_containers() {
    echo -e "${YELLOW}[5/7]${NC} Starting containers..."

    docker compose -f $COMPOSE_FILE up -d

    echo -e "${GREEN}✓${NC} Containers started"
}

###############################################################################
# Wait for services to be healthy
###############################################################################
wait_for_health() {
    echo -e "${YELLOW}[6/7]${NC} Waiting for services to be healthy..."

    sleep 10

    # Check backend health
    MAX_ATTEMPTS=30
    ATTEMPT=0

    while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
        if docker compose -f $COMPOSE_FILE exec -T backend node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} Backend is healthy"
            break
        fi

        ATTEMPT=$((ATTEMPT + 1))
        echo -e "Waiting for backend... (${ATTEMPT}/${MAX_ATTEMPTS})"
        sleep 2
    done

    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        echo -e "${RED}✗${NC} Backend health check failed"
        echo -e "${YELLOW}Check logs with: docker compose -f $COMPOSE_FILE logs backend${NC}"
    fi

    # Check admin-panel health
    if curl -f http://localhost/health &> /dev/null; then
        echo -e "${GREEN}✓${NC} Admin panel is healthy"
    else
        echo -e "${YELLOW}⚠️${NC}  Admin panel health check failed (may still be starting)"
    fi
}

###############################################################################
# Show deployment status
###############################################################################
show_status() {
    echo -e "${YELLOW}[7/7]${NC} Deployment Status"
    echo ""

    docker compose -f $COMPOSE_FILE ps

    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  🎉 Deployment Completed Successfully!                        ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📍 Service URLs:${NC}"
    echo -e "   • Main site:    http://${DOMAIN}/ (or https://${DOMAIN}/)"
    echo -e "   • Admin panel:  http://${DOMAIN}/admin"
    echo -e "   • API:          http://${DOMAIN}/api"
    echo ""
    echo -e "${BLUE}📊 Useful commands:${NC}"
    echo -e "   • View logs:           docker compose -f $COMPOSE_FILE logs -f"
    echo -e "   • View backend logs:   docker compose -f $COMPOSE_FILE logs -f backend"
    echo -e "   • View admin logs:     docker compose -f $COMPOSE_FILE logs -f admin-panel"
    echo -e "   • Restart services:    docker compose -f $COMPOSE_FILE restart"
    echo -e "   • Stop services:       docker compose -f $COMPOSE_FILE down"
    echo ""
}

###############################################################################
# Main execution
###############################################################################
main() {
    check_env_file
    check_docker
    stop_containers
    build_images
    start_containers
    wait_for_health
    show_status
}

# Run main function
main
