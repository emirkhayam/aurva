# 🔗 Интеграция Frontend с Backend API

Руководство по подключению существующего HTML сайта AURVA к новому Backend API.

---

## 📋 Что нужно сделать

1. ✅ Обновить контактную форму для отправки данных на API
2. ✅ Загружать новости динамически с API
3. ✅ Загружать участников/партнеров динамически с API
4. ✅ Создать админ-панель для управления контентом

---

## 1️⃣ Обновление контактной формы

### Текущий код (static HTML)

Найдите форму в `generated-page.html` (строка ~716):

```html
<form class="space-y-4">
    <input type="text" id="name" placeholder="Название компании / Имя">
    <input type="tel" id="phone" placeholder="Контактный телефон">
    <button type="submit">Оставить заявку</button>
</form>
```

### Новый код (с отправкой на API)

Замените на:

```html
<form id="contactForm" class="space-y-4">
    <input type="text" id="name" name="name" required
           placeholder="Название компании / Имя"
           class="w-full bg-[color:var(--bg-surface)] border border-[color:var(--border)] rounded-lg px-4 py-3.5 text-sm">

    <input type="tel" id="phone" name="phone" required
           placeholder="Контактный телефон"
           class="w-full bg-[color:var(--bg-surface)] border border-[color:var(--border)] rounded-lg px-4 py-3.5 text-sm">

    <button type="submit" id="submitBtn"
            class="w-full py-3.5 bg-[color:var(--accent)] text-white text-sm font-semibold rounded-lg">
        Оставить заявку
    </button>

    <!-- Сообщения об успехе/ошибке -->
    <div id="formMessage" class="hidden mt-4 p-3 rounded-lg text-sm"></div>
</form>

<script>
const API_URL = 'http://localhost:5000/api'; // Измените на ваш домен в production

document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const formMessage = document.getElementById('formMessage');

    // Получить данные формы
    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value
    };

    // Disable кнопку
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';
    formMessage.classList.add('hidden');

    try {
        const response = await fetch(`${API_URL}/contacts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            // Успех
            formMessage.textContent = data.message || 'Заявка успешно отправлена!';
            formMessage.className = 'mt-4 p-3 rounded-lg text-sm bg-green-100 text-green-800';
            formMessage.classList.remove('hidden');

            // Очистить форму
            document.getElementById('contactForm').reset();
        } else {
            // Ошибка от сервера
            formMessage.textContent = data.error || 'Ошибка при отправке заявки';
            formMessage.className = 'mt-4 p-3 rounded-lg text-sm bg-red-100 text-red-800';
            formMessage.classList.remove('hidden');
        }
    } catch (error) {
        // Сетевая ошибка
        formMessage.textContent = 'Ошибка соединения с сервером. Попробуйте позже.';
        formMessage.className = 'mt-4 p-3 rounded-lg text-sm bg-red-100 text-red-800';
        formMessage.classList.remove('hidden');
        console.error('Error:', error);
    } finally {
        // Enable кнопку обратно
        submitBtn.disabled = false;
        submitBtn.textContent = 'Оставить заявку';
    }
});
</script>
```

---

## 2️⃣ Динамическая загрузка новостей

### Добавьте скрипт загрузки новостей

Найдите секцию новостей (id="news") и добавьте после неё:

```html
<script>
const API_URL = 'http://localhost:5000/api';

// Загрузка новостей
async function loadNews() {
    try {
        const response = await fetch(`${API_URL}/news?published=true&limit=3`);
        const data = await response.json();

        if (data.news && data.news.length > 0) {
            renderNews(data.news);
        }
    } catch (error) {
        console.error('Error loading news:', error);
    }
}

function renderNews(newsItems) {
    const newsContainer = document.querySelector('#news .grid');
    if (!newsContainer) return;

    newsContainer.innerHTML = newsItems.map(item => `
        <a href="#" class="group bg-[color:var(--bg-card)] border border-[color:var(--border)] rounded-2xl flex flex-col h-full relative overflow-hidden hover:bg-[color:var(--bg-card-hover)] transition-all duration-300 shadow-[var(--shadow)] transform hover:scale-[1.02]">
            <div class="h-48 bg-[color:var(--bg-surface)] relative overflow-hidden border-b border-[color:var(--border)]">
                <div class="group-hover:scale-105 transition-transform duration-500 bg-cover bg-center absolute inset-0"
                     style="background-image: url('${item.imageUrl || 'https://via.placeholder.com/400x300'}');"></div>
            </div>
            <div class="p-6 flex flex-col flex-1 relative z-10 bg-[color:var(--bg-card)]">
                <div class="flex items-center justify-between mb-4">
                    <span class="text-[9px] font-mono text-[color:var(--accent)] bg-[color:var(--accent-soft)] px-1.5 py-0.5 rounded border border-[color:var(--border)] uppercase tracking-wide">
                        ${getCategoryLabel(item.category)}
                    </span>
                    <span class="text-[10px] font-mono text-[color:var(--text-subtle)]">
                        ${formatDate(item.publishedAt)}
                    </span>
                </div>
                <h3 class="text-lg font-semibold text-[color:var(--text)] mb-2 tracking-tight line-clamp-2">
                    ${item.title}
                </h3>
                <p class="text-xs text-[color:var(--text-muted)] mb-8 line-clamp-3 font-light leading-relaxed">
                    ${item.excerpt}
                </p>
                <div class="mt-auto pt-4 border-t border-[color:var(--border)] flex items-center justify-between">
                    <span class="text-[9px] font-mono text-[color:var(--text-subtle)] group-hover:text-[color:var(--accent)] uppercase tracking-widest transition-colors">
                        Читать
                    </span>
                    <iconify-icon icon="solar:arrow-right-up-linear" class="text-sm text-[color:var(--text-subtle)] group-hover:text-[color:var(--accent)] transition-colors"></iconify-icon>
                </div>
            </div>
        </a>
    `).join('');
}

function getCategoryLabel(category) {
    const labels = {
        'regulation': 'Регулирование',
        'events': 'События',
        'analytics': 'Аналитика',
        'other': 'Новости'
    };
    return labels[category] || 'Новости';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Загрузить новости при загрузке страницы
document.addEventListener('DOMContentLoaded', loadNews);
</script>
```

---

## 3️⃣ Динамическая загрузка участников

### Добавьте скрипт загрузки партнеров

Найдите секцию участников (id="members") и добавьте:

```html
<script>
const API_URL = 'http://localhost:5000/api';

// Загрузка участников
async function loadMembers() {
    try {
        const response = await fetch(`${API_URL}/members?isActive=true`);
        const data = await response.json();

        if (data.members && data.members.length > 0) {
            renderMembers(data.members);
        }
    } catch (error) {
        console.error('Error loading members:', error);
    }
}

function renderMembers(members) {
    const membersContainer = document.querySelector('#members .grid');
    if (!membersContainer) return;

    membersContainer.innerHTML = members.map(member => `
        <a href="${member.website || '#'}" target="_blank"
           class="h-32 md:h-40 group bg-white border border-[color:var(--border)] rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-[var(--shadow)] overflow-hidden px-6">
            <img src="${member.logoUrl || 'https://via.placeholder.com/200x100'}"
                 alt="${member.name}"
                 class="max-h-16 md:max-h-24 w-auto object-contain transition-all duration-500 group-hover:scale-105">
        </a>
    `).join('');
}

// Загрузить участников при загрузке страницы
document.addEventListener('DOMContentLoaded', loadMembers);
</script>
```

---

## 4️⃣ Создание простой админ-панели

Создайте новый файл `admin.html` в корне проекта:

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AURVA - Админ-панель</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">

    <!-- Login Form -->
    <div id="loginScreen" class="min-h-screen flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h1 class="text-2xl font-bold mb-6 text-center">AURVA Admin</h1>
            <form id="loginForm">
                <input type="email" id="email" placeholder="Email" required
                       class="w-full px-4 py-3 border rounded-lg mb-4">
                <input type="password" id="password" placeholder="Пароль" required
                       class="w-full px-4 py-3 border rounded-lg mb-4">
                <button type="submit"
                        class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
                    Войти
                </button>
                <div id="loginError" class="hidden mt-4 p-3 bg-red-100 text-red-700 rounded"></div>
            </form>
        </div>
    </div>

    <!-- Admin Dashboard -->
    <div id="dashboardScreen" class="hidden min-h-screen">
        <nav class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                <h1 class="text-xl font-bold">AURVA Admin</h1>
                <button onclick="logout()" class="text-red-600 hover:text-red-700">Выйти</button>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto p-4">
            <!-- Tabs -->
            <div class="flex gap-2 mb-6">
                <button onclick="showTab('contacts')" class="tab-btn px-4 py-2 rounded bg-blue-600 text-white">Заявки</button>
                <button onclick="showTab('news')" class="tab-btn px-4 py-2 rounded bg-gray-200">Новости</button>
                <button onclick="showTab('members')" class="tab-btn px-4 py-2 rounded bg-gray-200">Участники</button>
            </div>

            <!-- Content Areas -->
            <div id="contactsTab" class="tab-content">
                <h2 class="text-2xl font-bold mb-4">Заявки на вступление</h2>
                <div id="contactsList" class="space-y-4"></div>
            </div>

            <div id="newsTab" class="tab-content hidden">
                <h2 class="text-2xl font-bold mb-4">Управление новостями</h2>
                <p class="text-gray-600">Coming soon...</p>
            </div>

            <div id="membersTab" class="tab-content hidden">
                <h2 class="text-2xl font-bold mb-4">Управление участниками</h2>
                <p class="text-gray-600">Coming soon...</p>
            </div>
        </div>
    </div>

    <script>
        const API_URL = 'http://localhost:5000/api';
        let authToken = localStorage.getItem('adminToken');

        // Check if logged in
        if (authToken) {
            showDashboard();
        }

        // Login
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    authToken = data.token;
                    localStorage.setItem('adminToken', authToken);
                    showDashboard();
                } else {
                    document.getElementById('loginError').textContent = data.error;
                    document.getElementById('loginError').classList.remove('hidden');
                }
            } catch (error) {
                alert('Ошибка соединения с сервером');
            }
        });

        function showDashboard() {
            document.getElementById('loginScreen').classList.add('hidden');
            document.getElementById('dashboardScreen').classList.remove('hidden');
            loadContacts();
        }

        function logout() {
            localStorage.removeItem('adminToken');
            location.reload();
        }

        function showTab(tab) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
            document.querySelectorAll('.tab-btn').forEach(el => {
                el.classList.remove('bg-blue-600', 'text-white');
                el.classList.add('bg-gray-200');
            });

            document.getElementById(`${tab}Tab`).classList.remove('hidden');
            event.target.classList.add('bg-blue-600', 'text-white');
            event.target.classList.remove('bg-gray-200');

            if (tab === 'contacts') loadContacts();
        }

        async function loadContacts() {
            try {
                const response = await fetch(`${API_URL}/contacts`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });

                const data = await response.json();

                const container = document.getElementById('contactsList');
                container.innerHTML = data.contacts.map(contact => `
                    <div class="bg-white p-4 rounded-lg shadow">
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="font-semibold">${contact.name}</h3>
                                <p class="text-gray-600">${contact.phone}</p>
                                <p class="text-sm text-gray-500">${new Date(contact.createdAt).toLocaleString('ru-RU')}</p>
                            </div>
                            <span class="px-3 py-1 rounded text-sm ${getStatusColor(contact.status)}">
                                ${getStatusLabel(contact.status)}
                            </span>
                        </div>
                    </div>
                `).join('');
            } catch (error) {
                console.error('Error loading contacts:', error);
            }
        }

        function getStatusColor(status) {
            const colors = {
                'new': 'bg-blue-100 text-blue-800',
                'contacted': 'bg-yellow-100 text-yellow-800',
                'processed': 'bg-green-100 text-green-800',
                'rejected': 'bg-red-100 text-red-800'
            };
            return colors[status] || 'bg-gray-100 text-gray-800';
        }

        function getStatusLabel(status) {
            const labels = {
                'new': 'Новая',
                'contacted': 'Связались',
                'processed': 'Обработана',
                'rejected': 'Отклонена'
            };
            return labels[status] || status;
        }
    </script>
</body>
</html>
```

---

## 5️⃣ CORS настройка

В файле `backend/.env` обновите:

```env
# Для локальной разработки
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:5500

# Для production (ваш домен)
CORS_ORIGIN=https://aurva.kg
```

---

## 6️⃣ Production deployment

### Для frontend (HTML файлы):
- Загрузите на хостинг (Netlify, Vercel, GitHub Pages, и т.д.)
- Обновите `API_URL` на production URL бэкенда

### Для backend:
- Разместите на VPS (DigitalOcean, Hetzner, AWS)
- Настройте nginx как reverse proxy
- Используйте PM2 для управления процессом
- Настройте SSL сертификат (Let's Encrypt)

**Пример nginx конфига:**
```nginx
server {
    listen 80;
    server_name api.aurva.kg;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## ✅ Чеклист интеграции

- [ ] Backend запущен и доступен
- [ ] Контактная форма отправляет данные на API
- [ ] Новости загружаются динамически
- [ ] Участники загружаются динамически
- [ ] Админ-панель работает
- [ ] Email уведомления настроены
- [ ] CORS настроен правильно
- [ ] Протестированы все функции

---

Готово! Frontend и Backend интегрированы! 🎉
