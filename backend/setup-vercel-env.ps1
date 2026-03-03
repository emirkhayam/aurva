# Автоматическая настройка Environment Variables для Vercel
# AURVA Backend

Write-Host "🔧 Setting up Vercel Environment Variables..." -ForegroundColor Cyan
Write-Host ""

# Переменные для настройки
$envVars = @{
    "NODE_ENV" = "production"
    "JWT_SECRET" = "5cf89d9f8b9ef80e2d767aae54c59dd509431344fdc78af085c477a18f329135"
    "JWT_EXPIRES_IN" = "7d"
    "CORS_ORIGIN" = "*"
    "EMAIL_HOST" = "smtp.gmail.com"
    "EMAIL_PORT" = "587"
    "EMAIL_SECURE" = "false"
    "MAX_FILE_SIZE" = "5242880"
    "UPLOAD_PATH" = "/tmp/uploads"
}

# Переменные которые нужно ввести вручную
Write-Host "⚠️  Некоторые переменные требуют ваших данных:" -ForegroundColor Yellow
Write-Host ""

$EMAIL_USER = Read-Host "Введите EMAIL_USER (например: aurva.kg@gmail.com)"
$EMAIL_PASSWORD = Read-Host "Введите EMAIL_PASSWORD (Gmail App Password)" -AsSecureString
$EMAIL_PASSWORD_Plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($EMAIL_PASSWORD))
$ADMIN_EMAIL = Read-Host "Введите ADMIN_EMAIL (например: admin@aurva.kg)"
$ADMIN_PASSWORD = Read-Host "Введите ADMIN_PASSWORD" -AsSecureString
$ADMIN_PASSWORD_Plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($ADMIN_PASSWORD))

# Добавляем введенные переменные
$envVars["EMAIL_USER"] = $EMAIL_USER
$envVars["EMAIL_PASSWORD"] = $EMAIL_PASSWORD_Plain
$envVars["EMAIL_FROM"] = $EMAIL_USER
$envVars["ADMIN_EMAIL"] = $ADMIN_EMAIL
$envVars["ADMIN_PASSWORD"] = $ADMIN_PASSWORD_Plain

Write-Host ""
Write-Host "📝 Добавление переменных в Vercel..." -ForegroundColor Blue
Write-Host ""

$count = 0
$total = $envVars.Count

foreach ($key in $envVars.Keys) {
    $count++
    $value = $envVars[$key]

    Write-Host "[$count/$total] Добавление $key..." -ForegroundColor Gray

    # Создаем временный файл с ответами для автоматизации
    $answers = "production`n"  # value
    $answers += "y`n"          # Production
    $answers += "y`n"          # Preview
    $answers += "y`n"          # Development

    # Используем pipe для автоматических ответов
    $answers | npx vercel env add $key 2>$null | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ $key добавлен" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ $key возможно уже существует или произошла ошибка" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ Настройка завершена!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Перезапускаем deployment..." -ForegroundColor Blue

# Redeploy для применения переменных
npx vercel --prod --force

Write-Host ""
Write-Host "🎉 Готово! Ваш API должен заработать." -ForegroundColor Green
Write-Host ""
