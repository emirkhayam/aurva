# 🚀 AURVA News Import - Простая Инструкция

## Метод 1: Букмарклет (Самый простой - 1 клик!)

### Шаг 1: Создайте закладку
1. Откройте браузер (Chrome/Edge)
2. Нажмите **Ctrl+Shift+B** чтобы показать панель закладок
3. Правый клик на панели → **"Добавить страницу"** (Add Page)
4. Заполните:
   - **Имя**: `Download AURVA News`
   - **URL**: Скопируйте код ниже:

```javascript
javascript:(function(){fetch('https://feed.tildacdn.com/api/getfeed/?feeduid=390736647451&size=100&sort[date]=desc').then(r=>r.json()).then(d=>{const b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='aurva-news-manual.json';document.body.appendChild(a);a.click();document.body.removeChild(a);alert('✅ Скачано '+d.posts.length+' новостей!')}).catch(e=>alert('❌ Ошибка: '+e.message))})();
```

5. Сохраните

### Шаг 2: Используйте закладку
1. Откройте: https://aurva.kg/news
2. Кликните на закладку **"Download AURVA News"**
3. Файл автоматически скачается!

---

## Метод 2: Через Sources консоль (Без защиты вставки)

### Шаг 1: Откройте Sources консоль
1. Откройте: https://aurva.kg/news
2. Нажмите **F12**
3. Перейдите на вкладку **"Sources"**
4. Внизу нажмите кнопку **">>"** или **"Show console drawer"**
5. Откроется консоль внизу (здесь НЕТ защиты от вставки!)

### Шаг 2: Вставьте код
Вставьте этот код и нажмите Enter:

```javascript
fetch('https://feed.tildacdn.com/api/getfeed/?feeduid=390736647451&size=100&sort[date]=desc')
  .then(r => r.json())
  .then(data => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aurva-news-manual.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    console.log('✅ Скачано ' + data.posts.length + ' новостей!');
  })
  .catch(error => {
    console.error('❌ Ошибка:', error);
  });
```

### Шаг 3: Файл скачан!
Файл `aurva-news-manual.json` появится в папке Downloads.

---

## Метод 3: Напечатать команду вручную (Console)

Если все еще не работает, в обычной Console вкладке:

1. **ВРУЧНУЮ НАПЕЧАТАЙТЕ** (не копируйте!): `allow pasting`
2. Нажмите Enter
3. Теперь можете вставлять код из Метода 2

---

## 🎯 После скачивания файла

### Шаг 1: Переместите файл
Переместите `aurva-news-manual.json` из Downloads в:
```
C:\Users\user\Desktop\aurva - beta\backend\
```

### Шаг 2: Запустите импорт
Откройте терминал в папке backend и выполните:
```bash
npm run import:manual
```

### Шаг 3: Готово!
Все новости будут импортированы в базу данных с картинками и датами!

---

## ✅ Что будет импортировано

- ✅ Заголовки новостей
- ✅ Описания (excerpt)
- ✅ Полный контент
- ✅ Картинки (скачаются в `/public/uploads/news/`)
- ✅ Даты публикации
- ✅ Автоматические категории
- ✅ SEO-friendly слаги для URL

---

## 🆘 Проблемы?

Если ничего не работает, просто напишите мне "помощь" и я помогу!
