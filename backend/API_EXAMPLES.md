# 📮 Примеры API запросов для AURVA Backend

## Тестирование через cURL, Postman или Insomnia

---

## 🔐 Аутентификация

### 1. Вход в систему (Login)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@aurva.kg",
    "password": "ваш_пароль"
  }'
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

**Сохраните токен для дальнейших запросов!**

---

## 📝 Контакты (Заявки на вступление)

### 2. Отправить заявку (PUBLIC - без токена)

```bash
curl -X POST http://localhost:5000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "BitHub Кыргызстан",
    "phone": "+996 550 123 456"
  }'
```

### 3. Получить все заявки (требуется токен)

```bash
curl -X GET "http://localhost:5000/api/contacts?status=new&page=1&limit=20" \
  -H "Authorization: Bearer ВАШ_ТОКЕН"
```

### 4. Обновить статус заявки

```bash
curl -X PUT http://localhost:5000/api/contacts/1 \
  -H "Authorization: Bearer ВАШ_ТОКЕН" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "contacted",
    "notes": "Связались по телефону, договорились о встрече"
  }'
```

### 5. Удалить заявку

```bash
curl -X DELETE http://localhost:5000/api/contacts/1 \
  -H "Authorization: Bearer ВАШ_ТОКЕН"
```

---

## 📰 Новости

### 6. Получить все опубликованные новости (PUBLIC)

```bash
curl -X GET "http://localhost:5000/api/news?published=true&page=1&limit=10"
```

### 7. Получить новость по slug (PUBLIC)

```bash
curl -X GET http://localhost:5000/api/news/obsuzdenie-novogo-zakonoproekta
```

### 8. Создать новость с изображением (Multipart Form)

```bash
curl -X POST http://localhost:5000/api/news \
  -H "Authorization: Bearer ВАШ_ТОКЕН" \
  -F "title=Новый закон о криптовалютах принят" \
  -F "excerpt=Кыргызстан регулирует криптовалютный рынок" \
  -F "content=Полный текст новости здесь..." \
  -F "category=regulation" \
  -F "published=true" \
  -F "image=@/path/to/image.jpg"
```

**Или через JSON (без изображения):**

```bash
curl -X POST http://localhost:5000/api/news \
  -H "Authorization: Bearer ВАШ_ТОКЕН" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Новый закон о криптовалютах принят",
    "excerpt": "Кыргызстан регулирует криптовалютный рынок",
    "content": "Полный текст новости здесь...",
    "category": "regulation",
    "published": true
  }'
```

### 9. Обновить новость

```bash
curl -X PUT http://localhost:5000/api/news/1 \
  -H "Authorization: Bearer ВАШ_ТОКЕН" \
  -F "title=Обновленный заголовок" \
  -F "published=false"
```

### 10. Удалить новость

```bash
curl -X DELETE http://localhost:5000/api/news/1 \
  -H "Authorization: Bearer ВАШ_ТОКЕН"
```

---

## 🏢 Участники/Партнеры

### 11. Получить всех активных участников (PUBLIC)

```bash
curl -X GET "http://localhost:5000/api/members?isActive=true"
```

### 12. Получить участника по slug (PUBLIC)

```bash
curl -X GET http://localhost:5000/api/members/bithub
```

### 13. Добавить нового участника с логотипом

```bash
curl -X POST http://localhost:5000/api/members \
  -H "Authorization: Bearer ВАШ_ТОКЕН" \
  -F "name=BitHub" \
  -F "description=Первая криптобиржа Кыргызстана" \
  -F "website=https://bithub.kg" \
  -F "isActive=true" \
  -F "displayOrder=1" \
  -F "joinedDate=2024-10-14" \
  -F "logo=@/path/to/logo.png"
```

### 14. Обновить участника

```bash
curl -X PUT http://localhost:5000/api/members/1 \
  -H "Authorization: Bearer ВАШ_ТОКЕН" \
  -F "displayOrder=2" \
  -F "isActive=true"
```

### 15. Удалить участника

```bash
curl -X DELETE http://localhost:5000/api/members/1 \
  -H "Authorization: Bearer ВАШ_ТОКЕН"
```

---

## 👤 Профиль пользователя

### 16. Получить свой профиль

```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer ВАШ_ТОКЕН"
```

### 17. Изменить пароль

```bash
curl -X PUT http://localhost:5000/api/auth/change-password \
  -H "Authorization: Bearer ВАШ_ТОКЕН" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "старый_пароль",
    "newPassword": "новый_пароль"
  }'
```

---

## 🧪 Postman Collection (JSON)

Сохраните этот JSON как Postman коллекцию:

```json
{
  "info": {
    "name": "AURVA Backend API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@aurva.kg\",\n  \"password\": \"admin123\"\n}"
            },
            "url": {
              "raw": "http://localhost:5000/api/auth/login",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "auth", "login"]
            }
          }
        }
      ]
    },
    {
      "name": "Contacts",
      "item": [
        {
          "name": "Create Contact",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Test Company\",\n  \"phone\": \"+996 550 123 456\"\n}"
            },
            "url": {
              "raw": "http://localhost:5000/api/contacts",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "contacts"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "token",
      "value": "YOUR_JWT_TOKEN_HERE"
    }
  ]
}
```

---

## 🔧 Insomnia Workspace (YAML)

Или используйте Insomnia - импортируйте это:

```yaml
_type: export
__export_format: 4
__export_date: 2024-10-14T00:00:00.000Z
resources:
  - _id: req_login
    name: Login
    method: POST
    url: "{{ base_url }}/auth/login"
    body:
      mimeType: application/json
      text: |
        {
          "email": "admin@aurva.kg",
          "password": "admin123"
        }

  - _id: req_contacts_create
    name: Create Contact (Public)
    method: POST
    url: "{{ base_url }}/contacts"
    body:
      mimeType: application/json
      text: |
        {
          "name": "BitHub KG",
          "phone": "+996 550 999 010"
        }

  - _id: env_base
    name: Base Environment
    data:
      base_url: http://localhost:5000/api
      token: ""
```

---

## 💡 Советы по тестированию

1. **Сначала залогиньтесь** и сохраните токен
2. **Используйте переменные окружения** в Postman/Insomnia для токена
3. **Проверьте статус коды**: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized)
4. **Для загрузки файлов** используйте `multipart/form-data`
5. **Проверяйте логи сервера** при ошибках

---

## 📊 Тестирование через браузер (Fetch API)

Откройте консоль браузера (F12) и выполните:

```javascript
// Логин
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@aurva.kg',
    password: 'admin123'
  })
})
.then(res => res.json())
.then(data => {
  console.log('Token:', data.token);
  localStorage.setItem('token', data.token);
});

// Создать заявку (публичный endpoint)
fetch('http://localhost:5000/api/contacts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test Company',
    phone: '+996 550 123 456'
  })
})
.then(res => res.json())
.then(data => console.log('Contact created:', data));

// Получить новости (публичный endpoint)
fetch('http://localhost:5000/api/news?published=true&limit=5')
  .then(res => res.json())
  .then(data => console.log('News:', data));

// Получить участников (публичный endpoint)
fetch('http://localhost:5000/api/members?isActive=true')
  .then(res => res.json())
  .then(data => console.log('Members:', data));
```

---

Готово! Теперь вы можете протестировать все API endpoints! 🎉
