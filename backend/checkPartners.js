const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Проверка таблицы partners...\n');

// Проверяем структуру таблицы
db.all("PRAGMA table_info(partners)", (err, columns) => {
  if (err) {
    console.error('❌ Ошибка при получении структуры таблицы:', err);
    return;
  }

  if (!columns || columns.length === 0) {
    console.log('⚠️  Таблица partners не существует!');
    db.close();
    return;
  }

  console.log('✅ Структура таблицы partners:');
  columns.forEach(col => {
    console.log(`  - ${col.name} (${col.type})${col.notnull ? ' NOT NULL' : ''}${col.pk ? ' PRIMARY KEY' : ''}`);
  });
  console.log('');

  // Проверяем существующие записи
  db.all("SELECT id, name, slug, is_active, logo_url FROM partners", (err, rows) => {
    if (err) {
      console.error('❌ Ошибка при чтении данных:', err);
      db.close();
      return;
    }

    console.log(`📊 Найдено партнёров: ${rows.length}\n`);

    if (rows.length > 0) {
      console.log('Существующие партнёры:');
      rows.forEach(row => {
        console.log(`  ID: ${row.id} | Name: ${row.name} | Slug: ${row.slug} | Active: ${row.is_active} | Logo: ${row.logo_url || 'нет'}`);
      });
    } else {
      console.log('ℹ️  Партнёров в базе данных нет');
    }

    console.log('');

    // Проверяем индексы и ограничения
    db.all("SELECT sql FROM sqlite_master WHERE type='index' AND tbl_name='partners'", (err, indexes) => {
      if (err) {
        console.error('❌ Ошибка при получении индексов:', err);
      } else {
        console.log('📑 Индексы таблицы partners:');
        if (indexes.length > 0) {
          indexes.forEach(idx => {
            console.log(`  ${idx.sql}`);
          });
        } else {
          console.log('  Индексов нет');
        }
      }

      db.close();
    });
  });
});
