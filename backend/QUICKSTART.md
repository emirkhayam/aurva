# 🚀 Быстрый старт AURVA Backend

## Шаг 1: Установка зависимостей

```bash
cd backend
npm install
```

## Шаг 2: Настройка базы данных MySQL

### Установка MySQL (если еще не установлен)

**Windows:**
- Скачайте: https://dev.mysql.com/downloads/installer/
- Установите MySQL Server

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Linux:**
```bash
sudo apt-get install mysql-server
sudo systemctl start mysql
```

### Создание базы данных

Войдите в MySQL:
```bash
mysql -u root -p
```

Создайте базу данных:
```sql
CREATE DATABASE aurva_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

## Шаг 3: Настройка переменных окружения

Скопируйте пример файла:
```bash
cp .env.example .env
```

Отредактируйте `.env` файл с вашими настройками:

```env
# Server
PORT=5000
NODE_ENV=development

# Database - ВАЖНО: Укажите ваши данные!
DB_HOST=localhost
DB_PORT=3306
DB_NAME=aurva_db
DB_USER=root
DB_PASSWORD=ваш_пароль_mysql

# JWT - Сгенерируйте случайную строку
JWT_SECRET=измените_на_случайную_строку_для_безопасности
JWT_EXPIRES_IN=7d

# Email настройки (для Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=aurva.kg@gmail.com
EMAIL_PASSWORD=ваш_app_password_gmail
EMAIL_FROM=aurva.kg@gmail.com

# Администратор по умолчанию
ADMIN_EMAIL=admin@aurva.kg
ADMIN_PASSWORD=измените_этот_пароль

# CORS
CORS_ORIGIN=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads
```

### Настройка Email (Gmail)

1. Войдите в Google Account
2. Включите двухфакторную аутентификацию
3. Перейдите: https://myaccount.google.com/apppasswords
4. Создайте App Password для "Mail"
5. Скопируйте сгенерированный пароль в `EMAIL_PASSWORD`

## Шаг 4: Создание администратора

После настройки .env, создайте первого админа:

```bash
npm run seed:admin
```

Вы увидите:
```
✅ Admin user created successfully!
📧 Email: admin@aurva.kg
🔑 Password: ваш_пароль
⚠️  IMPORTANT: Change the default password after first login!
```

## Шаг 5: Запуск сервера

```bash
npm run dev
```

Вы увидите:
```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 AURVA Backend API Server Started                    ║
║                                                           ║
║   Port: 5000                                              ║
║   Environment: development                                ║
║   Database: MySQL - Connected ✅                          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

## Шаг 6: Проверка работы API

### Проверка здоровья сервера
```bash
curl http://localhost:5000/health
```

### Тест входа
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aurva.kg","password":"ваш_пароль"}'
```

Вы получите JWT токен для использования в остальных запросах.

## 🎉 Готово!

Backend API запущен и готов к работе!

### Следующие шаги:

1. **Измените пароль администратора** через `/api/auth/change-password`
2. **Интегрируйте frontend** - обновите HTML форму для отправки на `/api/contacts`
3. **Создайте админ-панель** для управления контентом
4. **Протестируйте все endpoints** согласно README.md

---

## 📝 Полезные команды

```bash
# Разработка с hot reload
npm run dev

# Сборка production версии
npm run build

# Запуск production версии
npm start

# Пересоздать админа
npm run seed:admin
```

---

## ⚠️ Важные замечания

1. **Безопасность:**
   - Измените `JWT_SECRET` на случайную строку
   - Измените `ADMIN_PASSWORD` после первого входа
   - Не коммитьте `.env` файл в git

2. **Production:**
   - Установите `NODE_ENV=production`
   - Используйте безопасный `CORS_ORIGIN`
   - Настройте реверс-прокси (nginx)

3. **Email:**
   - Gmail App Password обязателен (не основной пароль!)
   - Для production рекомендуется использовать SMTP сервис (SendGrid, AWS SES)

---

## 🐛 Решение проблем

### База данных не подключается
- Проверьте MySQL запущен: `mysql.server status` или `sudo systemctl status mysql`
- Проверьте данные в `.env`: `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Проверьте создана ли база: `mysql -u root -p -e "SHOW DATABASES;"`

### Email не отправляются
- Убедитесь что используете App Password, не основной пароль Gmail
- Проверьте настройки `EMAIL_*` в `.env`
- Проверьте логи сервера на ошибки

### Port уже занят
- Измените `PORT` в `.env` на другой (например 5001)
- Или остановите процесс на порту 5000: `lsof -ti:5000 | xargs kill`

---

Если проблема не решена, проверьте логи в консоли или обратитесь за помощью!
