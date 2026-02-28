# 🏦 AURVA - Ассоциация Участников Рынка Виртуальных Активов

**Официальный веб-сайт и backend API для AURVA Кыргызстана**

![AURVA](https://static.tildacdn.one/tild3830-6166-4531-b362-646165626563/_SITE.svg)

---

## 📖 О проекте

AURVA (Association of Virtual Assets Market Participants) - это независимая платформа, созданная для выстраивания конструктивного диалога между государством, бизнесом и пользователями в сфере виртуальных активов в Кыргызской Республике.

**Основана:** 14 октября 2024 года
**Участники:** 10+ компаний-лидеров криптоиндустрии

---

## 🏗️ Структура проекта

```
aurva - beta/
├── generated-page.html          # Frontend - основной сайт
├── backend/                     # Backend API
│   ├── src/                     # Исходный код
│   ├── uploads/                 # Загруженные файлы
│   ├── package.json
│   ├── README.md               # Backend документация
│   ├── QUICKSTART.md           # Быстрый старт backend
│   └── API_EXAMPLES.md         # Примеры API запросов
├── INTEGRATION_GUIDE.md        # Руководство по интеграции
└── README.md                   # Этот файл
```

---

## 🚀 Быстрый старт

### Frontend (HTML сайт)

Просто откройте `generated-page.html` в браузере или разместите на хостинге.

**Технологии:**
- HTML5, CSS3, JavaScript
- Tailwind CSS (через CDN)
- GSAP для анимаций
- Spline для 3D графики

### Backend API

```bash
# 1. Перейти в директорию backend
cd backend

# 2. Установить зависимости
npm install

# 3. Настроить .env файл
cp .env.example .env
# Отредактируйте .env с вашими настройками

# 4. Создать базу данных MySQL
mysql -u root -p -e "CREATE DATABASE aurva_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 5. Создать администратора
npm run seed:admin

# 6. Запустить сервер
npm run dev
```

Подробнее: `backend/QUICKSTART.md`

---

## 📚 Документация

- **[Backend README](backend/README.md)** - Полная документация API
- **[Quick Start Guide](backend/QUICKSTART.md)** - Быстрая настройка backend
- **[API Examples](backend/API_EXAMPLES.md)** - Примеры использования API
- **[Integration Guide](INTEGRATION_GUIDE.md)** - Интеграция frontend с backend

---

## 🔧 Технологический стек

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Tailwind CSS
- GSAP + ScrollTrigger
- Spline Design (3D графика)
- Iconify (иконки)

### Backend
- Node.js + Express
- TypeScript
- MySQL + Sequelize ORM
- JWT Authentication
- Multer (file uploads)
- Nodemailer (email)
- Helmet (security)

---

## 📋 Основные функции

### Публичный сайт
- ✅ Информация об ассоциации
- ✅ Направления работы
- ✅ Список участников/партнеров
- ✅ Новости индустрии
- ✅ Контактная форма для вступления

### Backend API
- ✅ Прием и управление заявками на вступление
- ✅ CRUD операции для новостей
- ✅ CRUD операции для участников
- ✅ Аутентификация администраторов (JWT)
- ✅ Загрузка изображений
- ✅ Email уведомления
- ✅ REST API документация

### Админ-панель
- ✅ Просмотр заявок
- ✅ Управление новостями
- ✅ Управление участниками
- ✅ Изменение статусов заявок

---

## 🌐 API Endpoints

**Base URL:** `http://localhost:5000/api`

### Публичные endpoints
```
GET    /news                  # Получить новости
GET    /news/:slug            # Получить новость по slug
GET    /members               # Получить участников
GET    /members/:slug         # Получить участника по slug
POST   /contacts              # Отправить заявку
```

### Защищенные endpoints (требуют токен)
```
POST   /auth/login            # Вход
GET    /auth/profile          # Профиль
PUT    /auth/change-password  # Изменить пароль

GET    /contacts              # Все заявки
PUT    /contacts/:id          # Обновить заявку
DELETE /contacts/:id          # Удалить заявку

POST   /news                  # Создать новость
PUT    /news/:id              # Обновить новость
DELETE /news/:id              # Удалить новость

POST   /members               # Создать участника
PUT    /members/:id           # Обновить участника
DELETE /members/:id           # Удалить участника
```

Полный список: `backend/README.md`

---

## 🔐 Безопасность

- Пароли хешируются с bcrypt
- JWT токены для аутентификации
- Helmet для защиты заголовков
- CORS настройка
- Валидация входных данных
- SQL injection защита (Sequelize ORM)
- Rate limiting (рекомендуется добавить)

---

## 📧 Email настройки

Backend отправляет email уведомления при новых заявках.

**Gmail настройка:**
1. Включите 2FA в Google Account
2. Создайте App Password: https://myaccount.google.com/apppasswords
3. Используйте App Password в `.env` файле

**Production рекомендации:**
- SendGrid
- AWS SES
- Mailgun
- Postmark

---

## 🚢 Deployment

### Frontend
- **Vercel** (рекомендуется)
- Netlify
- GitHub Pages
- Любой статический хостинг

### Backend
- **VPS** (DigitalOcean, Hetzner, Vultr)
- Heroku
- Railway
- AWS EC2

**Production чеклист:**
- [ ] Настроить HTTPS (Let's Encrypt)
- [ ] Настроить nginx reverse proxy
- [ ] Использовать PM2 для Node.js
- [ ] Настроить firewall
- [ ] Регулярные бэкапы базы данных
- [ ] Monitoring (Grafana, Prometheus)
- [ ] Обновить CORS_ORIGIN на production домен

---

## 🤝 Участники ассоциации

1. **BitHub** - https://bithub.kg
2. **Envoys** - https://envoys.vision
3. **Royal Inc.** - https://www.royal.inc
4. **KLN** - https://kln.kg
5. **WeChange** - https://www.wechange.kg
6. **Prime Finance** - https://primefinance.kg

---

## 📞 Контакты

- **Email:** aurva.kg@gmail.com
- **Телефон:** +996 550 99 90 10
- **Локация:** г. Бишкек, Кыргызская Республика

---

## 📄 Лицензия

© 2024 AURVA - Ассоциация Участников Рынка Виртуальных Активов. Все права защищены.

---

## 🛠️ Разработка

```bash
# Frontend - просто откройте HTML файл
open generated-page.html

# Backend - development mode
cd backend
npm run dev

# Backend - production build
npm run build
npm start

# Тестирование API
# См. backend/API_EXAMPLES.md
```

---

## 📊 База данных

### Таблицы

1. **users** - Администраторы и модераторы
2. **contacts** - Заявки на вступление
3. **news** - Новости
4. **members** - Участники ассоциации

### Схема создается автоматически при первом запуске

---

## 🎯 Roadmap

### ✅ Completed (v1.0.0-beta)
- [x] Frontend сайт (HTML/CSS/JS + Tailwind)
- [x] Backend API (Node.js + Express + TypeScript)
- [x] Контактная форма
- [x] Управление новостями (CRUD)
- [x] Управление участниками (CRUD)
- [x] Email уведомления (Nodemailer)
- [x] Полноценная админ-панель (React + TypeScript + Vite)
- [x] JWT Authentication
- [x] File uploads (images)
- [x] Security basics (Helmet, CORS, bcrypt)
- [x] Comprehensive documentation

### 🚧 In Progress (v1.1.0)
- [ ] Testing framework (Jest + Supertest)
- [ ] Error handling & logging (Winston)
- [ ] Rate limiting & security hardening
- [ ] API documentation (Swagger/OpenAPI)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Enhanced contact form (email field, validation)

### 📋 Planned (v1.2.0+)
- [ ] Production monitoring (Grafana/Prometheus)
- [ ] Redis caching layer
- [ ] Multi-language support (i18n)
- [ ] Member portal (login, profile, resources)
- [ ] Analytics dashboard
- [ ] Telegram bot интеграция
- [ ] Document management system
- [ ] File storage migration (S3/R2)
- [ ] Email queue (Bull + Redis)
- [ ] Search & filter functionality

---

## 🐛 Поддержка

При возникновении проблем:
1. Проверьте `backend/QUICKSTART.md`
2. Изучите `backend/README.md`
3. Проверьте логи сервера
4. Напишите на aurva.kg@gmail.com

---

**Создано с ❤️ для развития криптоиндустрии Кыргызстана**
