# 🚀 ФИНАЛЬНАЯ ИНСТРУКЦИЯ - Импорт всех новостей AURVA

## ✅ Решение готово! (2 простых шага)

С помощью Firecrawl API мы создали идеальное решение для импорта всех новостей с aurva.kg вместе с картинками и markdown файлами!

---

## 📋 ШАГ 1: Получение списка URL (30 секунд)

### Вариант A: Через HTML инструмент (РЕКОМЕНДУЕМ!)

1. Откройте файл в браузере:
   ```
   GET-NEWS-URLS.html
   ```

2. Нажмите кнопку **"Получить список URL"**

3. Файл `aurva-news-urls.json` автоматически скачается

4. Переместите файл в:
   ```
   C:\Users\user\Desktop\aurva - beta\backend\aurva-news-urls.json
   ```

### Вариант B: Через консоль браузера

1. Откройте: https://aurva.kg/news
2. Нажмите F12 → Console
3. Введите вручную: `allow pasting` и нажмите Enter
4. Вставьте код:

```javascript
fetch('https://feed.tildacdn.com/api/getfeed/?feeduid=390736647451&size=100&sort[date]=desc').then(r=>r.json()).then(d=>{const urls=d.posts.filter(p=>p.url).map(p=>({url:p.url,title:p.title,date:p.date,img:p.img||p.imgSmall||''}));const b=new Blob([JSON.stringify(urls,null,2)],{type:'application/json'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='aurva-news-urls.json';a.click();console.log('✅ Downloaded '+urls.length+' URLs!')})
```

5. Переместите скачанный файл в папку `backend/`

---

## 🔥 ШАГ 2: Автоматический импорт с Firecrawl (5-10 минут)

Откройте терминал в папке `backend` и выполните:

```bash
npm run import:firecrawl-batch
```

### Что произойдет:

1. ✅ Скрипт прочитает список URL из файла
2. ✅ Для КАЖДОЙ новости:
   - 🔥 Firecrawl скачает полный контент в markdown
   - 🖼️ Картинки скачаются локально в `/public/uploads/news/`
   - 💾 Markdown файлы сохранятся в `/backend/scraped-news/`
   - 📊 Запись добавится в базу данных
3. ✅ В конце покажет статистику

### Пример вывода:

```
═══════════════════════════════════════════
🔥 FIRECRAWL BATCH IMPORT - AURVA NEWS
═══════════════════════════════════════════

📂 Loading URLs from file...
✅ Loaded 45 URLs

🔌 Connecting to database...
✅ Connected

🗑️  Clearing existing news...
✅ Cleared

📰 Scraping and importing articles...

[1/45] Второй поток обучения бухгалтеров...
   🔥 Firecrawl: https://aurva.kg/tpost/zz95blxj01...
   💾 Saved: второй-поток-обучения-бухгалтеров.md
   ⬇️  Downloading image...
   ✅ Imported (ID: 1, Category: events)

[2/45] ...

═══════════════════════════════════════════
✅ BATCH IMPORT COMPLETED!
═══════════════════════════════════════════
✅ Success: 45 articles
❌ Failed: 0 articles
📰 Total in DB: 45
💾 Markdown files: C:\Users\user\Desktop\aurva - beta\backend\scraped-news
═══════════════════════════════════════════
```

---

## 📊 Что будет импортировано

### ✅ Для каждой новости:

- **Заголовок** - полный заголовок новости
- **Slug** - SEO-friendly URL (латиница + кириллица)
- **Excerpt** - краткое описание (первые 200 символов)
- **Content** - полный текст в Markdown формате
- **Category** - автоматическое определение:
  - `regulation` - регулирование, законы, лицензии
  - `events` - конференции, встречи, обучение
  - `analytics` - аналитика, отчеты, исследования
  - `other` - остальное
- **Image URL** - локальный путь к скачанной картинке
- **Published At** - дата публикации (парсинг русского формата)
- **Views** - случайное число 100-600

### 📁 Файловая структура:

```
backend/
├── public/uploads/news/
│   ├── второй-поток-обучения-бухгалтеров-1.jpeg
│   ├── регулирование-криптовалют-2.png
│   └── ...
├── scraped-news/
│   ├── второй-поток-обучения-бухгалтеров.md
│   ├── регулирование-криптовалют.md
│   └── ...
└── database.sqlite (все записи в таблице news)
```

---

## 🎯 Альтернативные методы

Если по какой-то причине основной метод не работает, у вас есть еще варианты:

### Метод 1: Одиночная новость
```bash
npm run import:firecrawl [URL]
```
Пример:
```bash
npm run import:firecrawl https://aurva.kg/tpost/zz95blxj01-vtoroi-potok-obucheniya-buhgalterov
```

### Метод 2: Ручной импорт (уже работает!)
```bash
npm run import:manual
```
(Требует файл `aurva-news-manual.json` из Tilda API)

---

## 🆘 Проблемы и решения

### Проблема: "File not found: aurva-news-urls.json"

**Решение:** Сначала выполните Шаг 1 - получите файл с URL

---

### Проблема: Firecrawl rate limit

**Решение:** Скрипт автоматически делает задержку 3 секунды между запросами. Если все равно получаете ошибку, увеличьте задержку в файле `firecrawlBatchImport.ts` (строка с `setTimeout`)

---

### Проблема: Ошибка 401 или 403 от Firecrawl

**Решение:** Проверьте API ключ. Текущий ключ: `fc-4d0aa75670724a2ab95f0b76408e94a7`

---

### Проблема: Некоторые новости не импортируются

**Решение:** Скрипт пропускает проблемные новости и показывает ошибку. В конце будет статистика успешных/неудачных импортов.

---

## 📚 Дополнительная информация

### Все доступные команды импорта:

```bash
npm run import:firecrawl         # Одна новость
npm run import:firecrawl-batch   # Массовый импорт (РЕКОМЕНДУЕТСЯ)
npm run import:firecrawl-hybrid  # Гибридный метод
npm run import:manual            # Ручной импорт из JSON
npm run import:aurva             # Базовый автоскрейпер
npm run import:enhanced          # Расширенный скрейпер
```

### Используемые технологии:

- **Firecrawl API** - профессиональный scraping с поддержкой JavaScript
- **Tilda Feed API** - официальный API для получения списка новостей
- **Markdown** - чистый формат для хранения контента
- **Sequelize ORM** - работа с базой данных
- **TypeScript** - типобезопасный код

---

## ✅ Готово!

После выполнения Шага 1 и Шага 2, все новости с aurva.kg будут импортированы в вашу базу данных вместе с картинками и markdown файлами!

**Следующие шаги:**
1. Проверьте новости в админ-панели
2. При необходимости отредактируйте категории
3. Настройте отображение на фронтенде

---

**🎉 Команда BMAD желает успехов!**
