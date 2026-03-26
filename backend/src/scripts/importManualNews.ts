import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import sequelize from '../config/database';
import { News } from '../models';

dotenv.config();

interface TildaPost {
  title: string;
  descr?: string;
  text?: string;
  img?: string;
  imgSmall?: string;
  date: string;
  url?: string;
}

interface TildaFeedResponse {
  posts: TildaPost[];
}

// Function to download image
async function downloadImage(url: string, filename: string): Promise<string> {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'news');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    console.log(`   ⬇️  Downloading: ${url.substring(0, 50)}...`);

    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, response.data);

    return `/uploads/news/${filename}`;
  } catch (error: any) {
    console.error(`   ❌ Download failed: ${error.message}`);
    return url;
  }
}

// Parse Russian date
function parseRussianDate(dateStr: string): Date {
  const months: { [key: string]: number } = {
    'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3,
    'мая': 4, 'июня': 5, 'июля': 6, 'августа': 7,
    'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11
  };

  const match = dateStr.match(/(\d+)\s+([а-я]+)\s+(\d{4})/i);
  if (match) {
    const day = parseInt(match[1]);
    const month = months[match[2].toLowerCase()];
    const year = parseInt(match[3]);
    return new Date(year, month, day);
  }

  return new Date();
}

// Generate slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^а-яёa-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

// Determine category
function determineCategory(title: string, excerpt: string): 'regulation' | 'events' | 'analytics' | 'other' {
  const text = (title + ' ' + excerpt).toLowerCase();

  if (text.includes('регулирован') || text.includes('закон') || text.includes('нацбанк') || text.includes('лицензи')) {
    return 'regulation';
  }
  if (text.includes('конференц') || text.includes('встреча') || text.includes('меропри') || text.includes('событи')) {
    return 'events';
  }
  if (text.includes('аналитик') || text.includes('отчет') || text.includes('исследован') || text.includes('статистик')) {
    return 'analytics';
  }

  return 'other';
}

async function importManualNews() {
  try {
    console.log('📥 Importing AURVA news from manual JSON...\n');

    // Check if JSON file exists
    const jsonPath = path.join(process.cwd(), 'aurva-news-manual.json');

    if (!fs.existsSync(jsonPath)) {
      console.error('❌ File not found: aurva-news-manual.json');
      console.log('\n📋 Please create the file with this content:');
      console.log('   1. Open https://aurva.kg/news in browser');
      console.log('   2. Press F12, open Console tab');
      console.log('   3. Paste this code and press Enter:\n');
      console.log('──────────────────────────────────────────');
      console.log(`
fetch('https://feed.tildacdn.com/api/getfeed/?feeduid=390736647451&size=100&sort[date]=desc')
  .then(r => r.json())
  .then(data => {
    console.log(JSON.stringify(data, null, 2));
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aurva-news-manual.json';
    a.click();
    alert('✅ File downloaded! Move it to backend folder.');
  })
  .catch(e => alert('❌ Error: ' + e.message));
      `);
      console.log('──────────────────────────────────────────\n');
      console.log('   4. File will download automatically');
      console.log('   5. Move it to: backend/aurva-news-manual.json');
      console.log('   6. Run: npm run import:manual\n');
      process.exit(1);
    }

    // Read JSON file
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    const feedData: TildaFeedResponse = JSON.parse(jsonContent);

    if (!feedData.posts || !Array.isArray(feedData.posts)) {
      throw new Error('Invalid JSON format - expected {posts: [...]}');
    }

    console.log(`✅ Found ${feedData.posts.length} news articles\n`);

    // Connect to database
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected\n');

    await sequelize.sync();

    // Clear existing news
    console.log('🗑️  Clearing existing news...');
    await News.destroy({ where: {} });
    console.log('✅ Cleared\n');

    console.log('💾 Importing articles...\n');

    let successCount = 0;
    let failCount = 0;

    for (const [index, post] of feedData.posts.entries()) {
      try {
        const title = post.title || '';
        const excerpt = post.descr || post.text?.substring(0, 200) || '';
        const content = post.text || post.descr || '';

        if (!title) {
          console.log(`[${index + 1}] ⚠️  Skipping - no title\n`);
          continue;
        }

        console.log(`[${index + 1}/${feedData.posts.length}] ${title.substring(0, 50)}...`);

        // Download image
        let localImageUrl = post.img || post.imgSmall || '';
        if (localImageUrl && localImageUrl.startsWith('http')) {
          const imageExt = localImageUrl.match(/\.(jpg|jpeg|png|gif|webp)/i)?.[1] || 'jpg';
          const imageFilename = `aurva-${index + 1}-${Date.now()}.${imageExt}`;
          localImageUrl = await downloadImage(localImageUrl, imageFilename);
        }

        // Parse date
        const publishedAt = parseRussianDate(post.date);

        // Generate slug
        const slug = generateSlug(title);

        // Determine category
        const category = determineCategory(title, excerpt);

        // Create news
        const news = await News.create({
          title: title,
          slug: slug,
          excerpt: excerpt,
          content: content,
          category: category,
          imageUrl: localImageUrl,
          published: true,
          publishedAt: publishedAt,
          views: Math.floor(Math.random() * 500) + 100
        });

        console.log(`   ✅ Created (ID: ${news.id}, Category: ${category})\n`);
        successCount++;
      } catch (error: any) {
        console.error(`   ❌ Failed: ${error.message}\n`);
        failCount++;
      }
    }

    console.log('═══════════════════════════════════════════');
    console.log('✅ AURVA NEWS IMPORT COMPLETED!');
    console.log('═══════════════════════════════════════════');
    console.log(`✅ Success: ${successCount} articles`);
    console.log(`❌ Failed: ${failCount} articles`);
    console.log(`📰 Total in DB: ${await News.count()}`);
    console.log('═══════════════════════════════════════════\n');

    // Delete the JSON file
    fs.unlinkSync(jsonPath);
    console.log('🗑️  Deleted aurva-news-manual.json\n');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

importManualNews();
