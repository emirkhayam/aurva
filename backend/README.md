# AURVA Backend API

Backend API для сайта AURVA - Ассоциация Участников Рынка Виртуальных Активов Кыргызстана.

## Технологический стек

- **Runtime:** Node.js
- **Framework:** Express.js + TypeScript
- **Database:** MySQL
- **ORM:** Sequelize
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Multer
- **Email:** Nodemailer
- **Security:** Helmet, CORS, bcryptjs

## Установка и запуск

### 1. Установка зависимостей

```bash
cd backend
npm install
```

### 2. Настройка окружения

Скопируйте файл `.env.example` в `.env` и настройте переменные:

```bash
cp .env.example .env
```

Отредактируйте `.env` файл:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=aurva_db
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=aurva.kg@gmail.com
EMAIL_PASSWORD=your_app_password

# Admin
ADMIN_EMAIL=admin@aurva.kg
ADMIN_PASSWORD=secure_password
```

### 3. Создание базы данных

Создайте MySQL базу данных:

```sql
CREATE DATABASE aurva_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Создание администратора

После настройки базы данных, создайте первого администратора:

```bash
npm run seed:admin
```

### 5. Запуск сервера

**Development mode (с hot reload):**
```bash
npm run dev
```

**Production build:**
```bash
npm run build
npm start
```

Сервер запустится на `http://localhost:5000`

## Структура проекта

```
backend/
├── src/
│   ├── config/          # Конфигурация (БД, и т.д.)
│   ├── controllers/     # Контроллеры (бизнес-логика)
│   ├── middleware/      # Middleware (auth, upload, и т.д.)
│   ├── models/          # Sequelize модели
│   ├── routes/          # API маршруты
│   ├── scripts/         # Утилиты и скрипты
│   ├── utils/           # Вспомогательные функции
│   └── server.ts        # Главный файл приложения
├── uploads/             # Загруженные файлы
│   ├── logos/          # Логотипы партнеров
│   └── news/           # Изображения новостей
├── .env.example        # Пример переменных окружения
├── package.json
└── tsconfig.json
```

## API Endpoints

### Базовый URL
```
http://localhost:5000/api
```

---

## Аутентификация

### Вход в систему
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@aurva.kg",
  "password": "your_password"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@aurva.kg",
    "name": "AURVA Administrator",
    "role": "admin"
  }
}
```

### Получить профиль
```http
GET /api/auth/profile
Authorization: Bearer {token}
```

### Изменить пароль
```http
PUT /api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

---

## Контакты (Заявки)

### Создать заявку (Public)
```http
POST /api/contacts
Content-Type: application/json

{
  "name": "Название компании",
  "phone": "+996 550 99 90 10"
}
```

**Response:**
```json
{
  "message": "Заявка успешно отправлена. Мы свяжемся с вами в ближайшее время.",
  "contact": {
    "id": 1,
    "name": "Название компании"
  }
}
```

### Получить все заявки (Admin/Moderator)
```http
GET /api/contacts?status=new&page=1&limit=20
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional): `new`, `contacted`, `processed`, `rejected`
- `page` (optional): номер страницы (default: 1)
- `limit` (optional): элементов на странице (default: 20)

### Обновить статус заявки (Admin/Moderator)
```http
PUT /api/contacts/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "contacted",
  "notes": "Связались по телефону"
}
```

### Удалить заявку (Admin/Moderator)
```http
DELETE /api/contacts/:id
Authorization: Bearer {token}
```

---

## Новости

### Получить все новости (Public)
```http
GET /api/news?published=true&category=regulation&page=1&limit=10
```

**Query Parameters:**
- `published` (optional): `true` или `false`
- `category` (optional): `regulation`, `events`, `analytics`, `other`
- `page` (optional): номер страницы
- `limit` (optional): элементов на странице

### Получить новость по slug (Public)
```http
GET /api/news/obsuzdenie-novogo-zakonoproekta
```

### Создать новость (Admin/Moderator)
```http
POST /api/news
Authorization: Bearer {token}
Content-Type: multipart/form-data

title: Заголовок новости
excerpt: Краткое описание
content: Полный текст новости
category: regulation
published: true
image: [файл изображения]
```

### Обновить новость (Admin/Moderator)
```http
PUT /api/news/:id
Authorization: Bearer {token}
Content-Type: multipart/form-data

[те же поля, что и при создании]
```

### Удалить новость (Admin/Moderator)
```http
DELETE /api/news/:id
Authorization: Bearer {token}
```

---

## Участники/Партнеры

### Получить всех участников (Public)
```http
GET /api/members?isActive=true&page=1&limit=50
```

**Query Parameters:**
- `isActive` (optional): `true` или `false`
- `page` (optional): номер страницы
- `limit` (optional): элементов на странице

### Получить участника по slug (Public)
```http
GET /api/members/bithub
```

### Создать участника (Admin/Moderator)
```http
POST /api/members
Authorization: Bearer {token}
Content-Type: multipart/form-data

name: BitHub
description: Описание компании
website: https://bithub.kg
isActive: true
displayOrder: 1
joinedDate: 2024-10-14
logo: [файл логотипа]
```

### Обновить участника (Admin/Moderator)
```http
PUT /api/members/:id
Authorization: Bearer {token}
Content-Type: multipart/form-data

[те же поля, что и при создании]
```

### Удалить участника (Admin/Moderator)
```http
DELETE /api/members/:id
Authorization: Bearer {token}
```

---

## Коды ошибок

- `200` - Успешно
- `201` - Создано успешно
- `400` - Неверный запрос
- `401` - Не авторизован
- `403` - Доступ запрещен
- `404` - Не найдено
- `500` - Внутренняя ошибка сервера

---

## Email уведомления

При подаче новой заявки через контактную форму, автоматически отправляется email на адрес администратора (`ADMIN_EMAIL` из `.env`).

Для настройки Gmail:
1. Включите двухфакторную аутентификацию
2. Создайте App Password: https://myaccount.google.com/apppasswords
3. Используйте App Password в переменной `EMAIL_PASSWORD`

---

## Безопасность

- Все пароли хешируются с использованием bcryptjs
- JWT токены для аутентификации
- Helmet для защиты заголовков
- CORS настроен для разрешенных доменов
- Валидация входных данных с express-validator
- Защита от SQL инъекций через Sequelize ORM

---

## Загрузка файлов

**Поддерживаемые форматы изображений:**
- JPEG / JPG
- PNG
- WebP
- SVG

**Максимальный размер файла:** 5MB (настраивается в `.env`)

**Директории загрузки:**
- `/uploads/logos/` - логотипы партнеров
- `/uploads/news/` - изображения новостей

---

## NPM Scripts

```bash
npm run dev          # Запуск в режиме разработки с hot reload
npm run build        # Компиляция TypeScript в JavaScript
npm start            # Запуск production версии
npm run seed:admin   # Создание администратора
```

---

## База данных

### Таблицы

1. **users** - Пользователи системы (администраторы, модераторы)
2. **contacts** - Заявки на вступление
3. **news** - Новости
4. **members** - Участники/партнеры ассоциации

### Миграции

Sequelize автоматически создаст таблицы при первом запуске в режиме development (`sync: { alter: true }`).

Для production рекомендуется использовать миграции Sequelize CLI.

---

## Поддержка

По вопросам работы backend API обращайтесь:
- Email: aurva.kg@gmail.com
- Телефон: +996 550 99 90 10

---

© 2024 AURVA - Ассоциация Участников Рынка Виртуальных Активов Кыргызстана
