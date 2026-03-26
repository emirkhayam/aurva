#!/bin/bash

# AURVA Deployment Verification Script
# Проверяет работоспособность всех компонентов после деплоя на Coolify
# Usage: bash verify-deployment.sh

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Domain to check
DOMAIN="https://aurva.kg"

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                           ║${NC}"
echo -e "${BLUE}║   🔍 AURVA Deployment Verification                       ║${NC}"
echo -e "${BLUE}║   Domain: ${DOMAIN}                              ║${NC}"
echo -e "${BLUE}║                                                           ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Counter for passed/failed tests
PASSED=0
FAILED=0

# Function to check endpoint
check_endpoint() {
    local url=$1
    local expected_code=$2
    local description=$3

    echo -n "Testing: $description... "

    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" -m 10)

    if [ "$response" -eq "$expected_code" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected_code, got $response)"
        ((FAILED++))
        return 1
    fi
}

# Function to check header
check_header() {
    local url=$1
    local header_name=$2
    local expected_value=$3
    local description=$4

    echo -n "Testing: $description... "

    header_value=$(curl -s -I "$url" -m 10 | grep -i "$header_name:" | cut -d' ' -f2- | tr -d '\r\n')

    if [[ "$header_value" == *"$expected_value"* ]]; then
        echo -e "${GREEN}✓ PASS${NC} ($header_name: $header_value)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_value, got: $header_value)"
        ((FAILED++))
        return 1
    fi
}

# Function to check JSON response
check_json() {
    local url=$1
    local expected_key=$2
    local description=$3

    echo -n "Testing: $description... "

    response=$(curl -s "$url" -m 10)

    if echo "$response" | grep -q "\"$expected_key\""; then
        echo -e "${GREEN}✓ PASS${NC} (Found key: $expected_key)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Key not found: $expected_key)"
        echo -e "   Response: $response"
        ((FAILED++))
        return 1
    fi
}

echo -e "${YELLOW}📡 1. SSL & HTTPS Checks${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_endpoint "$DOMAIN/" 200 "HTTPS connection to main domain"
check_endpoint "https://www.aurva.kg/" 200 "HTTPS connection to www subdomain"
echo ""

echo -e "${YELLOW}🏠 2. Public Website Checks${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_endpoint "$DOMAIN/" 200 "Homepage (index.html)"
check_endpoint "$DOMAIN/news" 200 "News page"
check_endpoint "$DOMAIN/about" 200 "About page"
check_header "$DOMAIN/" "Cache-Control" "no-cache" "HTML no-cache header"
check_header "$DOMAIN/news" "Cache-Control" "no-cache" "News page no-cache header"
echo ""

echo -e "${YELLOW}🔌 3. Backend API Checks${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_json "$DOMAIN/health" "status" "Health check endpoint"
check_json "$DOMAIN/api" "version" "API info endpoint"
check_endpoint "$DOMAIN/api/news" 200 "News API endpoint"
check_endpoint "$DOMAIN/api/members" 200 "Members API endpoint"
check_endpoint "$DOMAIN/api/partners" 200 "Partners API endpoint"
check_endpoint "$DOMAIN/api/team" 200 "Team API endpoint"
check_endpoint "$DOMAIN/api/settings" 200 "Settings API endpoint"
echo ""

echo -e "${YELLOW}👨‍💼 4. Admin Panel Checks${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_endpoint "$DOMAIN/admin" 200 "Admin panel entry point"
check_endpoint "$DOMAIN/login" 200 "Login page"
check_endpoint "$DOMAIN/admin/dashboard" 200 "Admin dashboard route"
check_header "$DOMAIN/admin" "Cache-Control" "no-cache" "Admin panel no-cache header"
echo ""

echo -e "${YELLOW}🔐 5. Security Headers Checks${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_header "$DOMAIN/" "X-Content-Type-Options" "nosniff" "X-Content-Type-Options header"
check_header "$DOMAIN/" "X-Frame-Options" "SAMEORIGIN" "X-Frame-Options header"
echo ""

echo -e "${YELLOW}⚡ 6. Performance Checks${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Measure response time for homepage
echo -n "Testing: Homepage response time... "
response_time=$(curl -o /dev/null -s -w '%{time_total}\n' "$DOMAIN/")
response_time_ms=$(echo "$response_time * 1000" | bc | cut -d'.' -f1)

if [ "$response_time_ms" -lt 2000 ]; then
    echo -e "${GREEN}✓ PASS${NC} (${response_time_ms}ms - Fast)"
    ((PASSED++))
elif [ "$response_time_ms" -lt 5000 ]; then
    echo -e "${YELLOW}⚠ WARN${NC} (${response_time_ms}ms - Acceptable)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (${response_time_ms}ms - Too slow)"
    ((FAILED++))
fi

# Measure response time for API
echo -n "Testing: API response time... "
api_response_time=$(curl -o /dev/null -s -w '%{time_total}\n' "$DOMAIN/api")
api_response_time_ms=$(echo "$api_response_time * 1000" | bc | cut -d'.' -f1)

if [ "$api_response_time_ms" -lt 1000 ]; then
    echo -e "${GREEN}✓ PASS${NC} (${api_response_time_ms}ms - Fast)"
    ((PASSED++))
elif [ "$api_response_time_ms" -lt 3000 ]; then
    echo -e "${YELLOW}⚠ WARN${NC} (${api_response_time_ms}ms - Acceptable)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (${api_response_time_ms}ms - Too slow)"
    ((FAILED++))
fi
echo ""

echo -e "${YELLOW}🗄️ 7. Database Connectivity Checks${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if API can fetch data (indicates DB connection is working)
echo -n "Testing: Database connection via news API... "
news_response=$(curl -s "$DOMAIN/api/news?page=1&limit=1" -m 10)

if echo "$news_response" | grep -q "\"data\""; then
    echo -e "${GREEN}✓ PASS${NC} (API returns data)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (No data returned)"
    echo -e "   Response: $news_response"
    ((FAILED++))
fi
echo ""

echo -e "${YELLOW}❌ 8. Error Handling Checks${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_endpoint "$DOMAIN/nonexistent-page" 404 "404 error for non-existent pages"
check_endpoint "$DOMAIN/api/nonexistent-endpoint" 404 "404 error for non-existent API"
echo ""

# Final summary
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                           ║${NC}"
echo -e "${BLUE}║   📊 VERIFICATION SUMMARY                                 ║${NC}"
echo -e "${BLUE}║                                                           ║${NC}"

TOTAL=$((PASSED + FAILED))
SUCCESS_RATE=$(echo "scale=1; $PASSED * 100 / $TOTAL" | bc)

if [ "$FAILED" -eq 0 ]; then
    echo -e "${BLUE}║   ${GREEN}✓ All tests passed! (${PASSED}/${TOTAL})${BLUE}                          ║${NC}"
    echo -e "${BLUE}║   ${GREEN}🎉 Deployment is healthy and ready!${BLUE}                   ║${NC}"
elif [ "$SUCCESS_RATE" -gt 80 ]; then
    echo -e "${BLUE}║   ${YELLOW}⚠ Most tests passed (${PASSED}/${TOTAL} - ${SUCCESS_RATE}%)${BLUE}              ║${NC}"
    echo -e "${BLUE}║   ${YELLOW}⚠ Some issues detected, check logs${BLUE}                    ║${NC}"
else
    echo -e "${BLUE}║   ${RED}✗ Multiple tests failed (${PASSED}/${TOTAL} - ${SUCCESS_RATE}%)${BLUE}         ║${NC}"
    echo -e "${BLUE}║   ${RED}❌ Deployment has critical issues!${BLUE}                     ║${NC}"
fi

echo -e "${BLUE}║                                                           ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Exit with appropriate code
if [ "$FAILED" -eq 0 ]; then
    exit 0
else
    exit 1
fi
