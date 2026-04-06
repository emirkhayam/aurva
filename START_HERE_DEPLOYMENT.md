# 🎯 НАЧНИТЕ ОТСЮДА: Развертывание на c.aurva.kg

## ✅ Что уже сделано

Все готово к развертыванию! Изменения отправлены на GitHub:
- Commit ID: 3a56955
- Repository: https://github.com/emirkhayam/aurva

### Созданные файлы:
✅ `docker-compose.production.yml` - Production конфигурация
✅ `.env.production` - Шаблон переменных окружения
✅ `.coolify.yml` - Конфигурация Coolify для c.aurva.kg
✅ `deploy.sh` - Автоматический скрипт развертывания
✅ `COOLIFY_SETUP_C_AURVA.md` - **ГЛАВНАЯ ИНСТРУКЦИЯ**
✅ `DEPLOY_C_AURVA_KG.md` - Полное руководство
✅ `QUICK_DEPLOY_C_AURVA.md` - Быстрый старт
✅ `DEPLOYMENT_SUMMARY.md` - Сводка по проекту

---

## 🚀 Что делать дальше (3 простых шага)

### Шаг 1: Откройте Coolify

Зайдите в панель управления Coolify на вашем сервере

### Шаг 2: Следуйте главной инструкции

**Откройте файл:** `COOLIFY_SETUP_C_AURVA.md`

Эта инструкция содержит:
- Пошаговую настройку проекта в Coolify
- Список всех переменных окружения
- Настройку доменов и SSL
- Проверку работы

### Шаг 3: Запустите деплой

После настройки в Coolify просто нажмите кнопку **"Deploy"** - всё остальное произойдет автоматически!

---

## 📚 Документация

| Документ | Когда использовать |
|----------|-------------------|
| **COOLIFY_SETUP_C_AURVA.md** | ⭐ **НАЧНИТЕ С ЭТОГО** - Настройка Coolify |
| DEPLOYMENT_SUMMARY.md | Краткая сводка по проекту |
| DEPLOY_C_AURVA_KG.md | Полное руководство с Docker и SSL |
| QUICK_DEPLOY_C_AURVA.md | Быстрое развертывание за 5 минут |

---

## ⚠️ Важно: Что нужно изменить в Coolify

При добавлении переменных окружения **ОБЯЗАТЕЛЬНО ИЗМЕНИТЕ**:

### 1. JWT Секреты (сгенерируйте новые!)
```bash
# Выполните на сервере:
openssl rand -base64 32
```

Замените значения:
- `JWT_SECRET` → ваш-сгенерированный-ключ
- `AUTH_JWT_SECRET` → другой-сгенерированный-ключ

### 2. Пароль администратора
```bash
ADMIN_PASSWORD=ваш-надежный-пароль-минимум-12-символов
```

### 3. Email настройки
```bash
EMAIL_USER=ваш-email@gmail.com
EMAIL_PASSWORD=app-password-от-gmail
```

**Как получить App Password:**
1. https://myaccount.google.com/apppasswords
2. Создайте App Password для Mail
3. Используйте его в `EMAIL_PASSWORD`

---

## 📋 Быстрый чеклист

### В Coolify:
- [ ] Создан новый проект "AURVA Production"
- [ ] Тип проекта: Docker Compose
- [ ] Подключен GitHub репозиторий: `emirkhayam/aurva`
- [ ] Указан файл: `docker-compose.production.yml`
- [ ] Добавлены домены: `c.aurva.kg` и `www.c.aurva.kg`
- [ ] Включен SSL (Let's Encrypt)
- [ ] Добавлены ВСЕ переменные окружения
- [ ] Изменены JWT секреты на случайные значения
- [ ] Изменен пароль администратора
- [ ] Настроены email параметры
- [ ] Включен Auto Deploy
- [ ] Нажата кнопка "Deploy"

### После деплоя:
- [ ] Открывается: https://c.aurva.kg/
- [ ] Работает админ панель: https://c.aurva.kg/admin
- [ ] API отвечает: https://c.aurva.kg/api/health
- [ ] Вход в админ панель успешен
- [ ] SSL сертификат активен (зеленый замочек)

---

## 🎯 Пример: Куда что вводить в Coolify

### 1. При создании проекта:

**Project Name:** AURVA Production
**Repository:** emirkhayam/aurva
**Branch:** main
**Build Method:** Docker Compose
**Compose File:** docker-compose.production.yml

### 2. В разделе Domains:

Добавьте два домена:
```
c.aurva.kg
www.c.aurva.kg
```

Включите:
- ✅ Enable SSL
- ✅ Force HTTPS

### 3. В разделе Environment Variables:

Скопируйте все переменные из `.env.production` (файл в репозитории)

**ВАЖНО:** Измените эти значения:
```bash
JWT_SECRET=[СГЕНЕРИРУЙТЕ НОВЫЙ]
AUTH_JWT_SECRET=[СГЕНЕРИРУЙТЕ НОВЫЙ]
ADMIN_PASSWORD=[ВАШ ПАРОЛЬ]
EMAIL_USER=[ВАШ EMAIL]
EMAIL_PASSWORD=[APP PASSWORD]
```

Все остальные переменные можно оставить как есть.

---

## 💡 Полезные ссылки

- Ваш репозиторий: https://github.com/emirkhayam/aurva
- Последний коммит: https://github.com/emirkhayam/aurva/commit/3a56955
- Документация Coolify: https://coolify.io/docs

---

## 🆘 Нужна помощь?

### Если что-то не работает:

1. Откройте **COOLIFY_SETUP_C_AURVA.md** → раздел "Troubleshooting"
2. Проверьте логи в Coolify (раздел "Logs")
3. Убедитесь что все переменные окружения добавлены
4. Проверьте что DNS записи настроены правильно

### Контакты:
- Email: aurva.kg@gmail.com

---

## 🎉 Итого

**Проект полностью готов к развертыванию!**

Просто:
1. Откройте Coolify
2. Следуйте файлу `COOLIFY_SETUP_C_AURVA.md`
3. Нажмите "Deploy"
4. Через 5-10 минут сайт будет доступен на https://c.aurva.kg/

**Успехов! 🚀**

---

**P.S.** После успешного деплоя не забудьте:
- Войти в админ панель
- Добавить контент
- Настроить бэкапы в Coolify
- Добавить команду в Coolify (если нужно)
