# AURVA Railway Automated Deployment Script (PowerShell)
# Этот скрипт автоматизирует весь процесс деплоя на Railway для Windows

$ErrorActionPreference = "Stop"

Write-Host "🚂 AURVA Railway Deployment Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Railway CLI is installed
Write-Host "[1/8] Checking Railway CLI..." -ForegroundColor Blue
try {
    railway --version | Out-Null
    Write-Host "✓ Railway CLI already installed" -ForegroundColor Green
} catch {
    Write-Host "Railway CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g @railway/cli
    Write-Host "✓ Railway CLI installed" -ForegroundColor Green
}
Write-Host ""

# Step 2: Login to Railway
Write-Host "[2/8] Logging into Railway..." -ForegroundColor Blue
Write-Host "This will open your browser for authentication" -ForegroundColor Yellow
railway login
Write-Host "✓ Logged in successfully" -ForegroundColor Green
Write-Host ""

# Step 3: Create new project
Write-Host "[3/8] Creating Railway project..." -ForegroundColor Blue
Set-Location backend
railway init
Write-Host "✓ Project created" -ForegroundColor Green
Write-Host ""

# Step 4: Add PostgreSQL
Write-Host "[4/8] Adding PostgreSQL database..." -ForegroundColor Blue
railway add --plugin postgresql
Write-Host "✓ PostgreSQL added" -ForegroundColor Green
Write-Host ""

# Step 5: Set environment variables
Write-Host "[5/8] Setting environment variables..." -ForegroundColor Blue

# Generate JWT_SECRET
$JWT_SECRET = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

Write-Host "Setting variables..." -ForegroundColor Yellow
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
Write-Host ""
Write-Host "Please provide the following sensitive information:" -ForegroundColor Yellow
$EMAIL_USER = Read-Host "Gmail address (e.g., aurva.kg@gmail.com)"
$EMAIL_PASSWORD = Read-Host "Gmail App Password" -AsSecureString
$EMAIL_PASSWORD_Plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($EMAIL_PASSWORD))
$ADMIN_EMAIL = Read-Host "Admin email"
$ADMIN_PASSWORD = Read-Host "Admin password" -AsSecureString
$ADMIN_PASSWORD_Plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($ADMIN_PASSWORD))

railway variables set EMAIL_USER=$EMAIL_USER
railway variables set EMAIL_PASSWORD=$EMAIL_PASSWORD_Plain
railway variables set EMAIL_FROM=$EMAIL_USER
railway variables set ADMIN_EMAIL=$ADMIN_EMAIL
railway variables set ADMIN_PASSWORD=$ADMIN_PASSWORD_Plain

# Use Railway's PostgreSQL
railway variables set "DATABASE_URL=`${{Postgres.DATABASE_URL}}"

Write-Host "✓ Environment variables set" -ForegroundColor Green
Write-Host ""

# Step 6: Add persistent volume
Write-Host "[6/8] Adding persistent volume for uploads..." -ForegroundColor Blue
railway volume create uploads-volume --mount /app/uploads
Write-Host "✓ Volume created and mounted at /app/uploads" -ForegroundColor Green
Write-Host ""

# Step 7: Deploy
Write-Host "[7/8] Deploying to Railway..." -ForegroundColor Blue
railway up
Write-Host "✓ Deployment started" -ForegroundColor Green
Write-Host ""

# Step 8: Generate domain
Write-Host "[8/8] Generating public domain..." -ForegroundColor Blue
railway domain
Write-Host "✓ Domain generated" -ForegroundColor Green
Write-Host ""

# Get deployment info
Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your API is being deployed..." -ForegroundColor Blue
Write-Host ""
Write-Host "To check deployment status:"
Write-Host "  railway status"
Write-Host ""
Write-Host "To view logs:"
Write-Host "  railway logs"
Write-Host ""
Write-Host "To open dashboard:"
Write-Host "  railway open"
Write-Host ""
Write-Host "Note: Initial build may take 3-5 minutes" -ForegroundColor Yellow
Write-Host ""
Write-Host "Your JWT_SECRET (save this securely):"
Write-Host $JWT_SECRET -ForegroundColor Green
Write-Host ""
