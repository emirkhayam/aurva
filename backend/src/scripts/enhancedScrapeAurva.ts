import axios from 'axios';
import fs from 'fs';
import path from 'path';
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
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://aurva.kg/',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site'
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

// Try multiple methods to fetch feed data
async function fetchFeedData(): Promise<TildaFeedResponse | null> {
  const feedUrl = 'https://feed.tildacdn.com/api/getfeed/?feeduid=390736647451&size=100&sort[date]=desc';

  const strategies = [
    // Strategy 1: Direct fetch with full browser headers
    async () => {
      console.log('📡 Strategy 1: Direct API with browser headers...');
      return await axios.get(feedUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Referer': 'https://aurva.kg/',
          'Origin': 'https://aurva.kg',
          'Connection': 'keep-alive',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'cross-site',
          'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"'
        }
      });
    },

    // Strategy 2: Without origin/referer
    async () => {
      console.log('📡 Strategy 2: API without CORS headers...');
      return await axios.get(feedUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        }
      });
    },

    // Strategy 3: Via main page first (session establishment)
    async () => {
      console.log('📡 Strategy 3: Establishing session via main page...');
      await axios.get('https://aurva.kg/news', {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      return await axios.get(feedUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Referer': 'https://aurva.kg/news'
        }
      });
    }
  ];

  for (let i = 0; i < strategies.length; i++) {
    try {
      const response = await strategies[i]();
      if (response.data && response.data.posts && Array.isArray(response.data.posts)) {
        console.log(`✅ Success with Strategy ${i + 1}!\n`);
        return response.data;
      }
    } catch (error: any) {
      console.log(`   ⚠️  Strategy ${i + 1} failed: ${error.message}`);
      if (i === strategies.length - 1) {
        console.log('   ❌ All strategies failed\n');
      }
    }
  }

  return null;
}

async function enhancedScrapeAurva() {
  try {
    console.log('═══════════════════════════════════════════');
    console.log('🚀 ENHANCED AURVA NEWS SCRAPER');
    console.log('═══════════════════════════════════════════\n');

    // Try to fetch feed data
    console.log('📡 Attempting to fetch news from Tilda Feed...\n');
    const feedData = await fetchFeedData();

    if (!feedData || !feedData.posts || feedData.posts.length === 0) {
      console.log('\n❌ Could not fetch data automatically.\n');
      console.log('═══════════════════════════════════════════');
      console.log('📋 ALTERNATIVE: Use Browser Method');
      console.log('═══════════════════════════════════════════');
      console.log('1. Open: https://aurva.kg/news');
      console.log('2. Open Developer Console (F12)');
      console.log('3. Paste this code:\n');
      console.log('fetch(\'https://feed.tildacdn.com/api/getfeed/?feeduid=390736647451&size=100&sort[date]=desc\')');
      console.log('  .then(r => r.json())');
      console.log('  .then(data => {');
      console.log('    const blob = new Blob([JSON.stringify(data, null, 2)], {type: \'application/json\'});');
      console.log('    const url = URL.createObjectURL(blob);');
      console.log('    const a = document.createElement(\'a\');');
      console.log('    a.href = url;');
      console.log('    a.download = \'aurva-news-manual.json\';');
      console.log('    a.click();');
      console.log('    console.log(\'✅ Downloaded!\');');
      console.log('  })\n');
      console.log('4. Move file to: backend/aurva-news-manual.json');
      console.log('5. Run: npm run import:manual');
      console.log('═══════════════════════════════════════════\n');
      process.exit(1);
    }

    console.log(`✅ Found ${feedData.posts.length} news articles!\n`);

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

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Fatal Error:', error.message);
    process.exit(1);
  }
}

enhancedScrapeAurva();
