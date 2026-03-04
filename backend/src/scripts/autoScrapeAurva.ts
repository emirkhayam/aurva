import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import sequelize from '../config/database';
import { News } from '../models';

dotenv.config();

interface AurvaNewsItem {
  title: string;
  excerpt: string;
  content?: string;
  imageUrl: string;
  date: string;
  link?: string;
  category?: string;
}

// Function to download image
async function downloadImage(url: string, filename: string): Promise<string> {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'news');

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    console.log(`   ⬇️  Downloading image: ${url.substring(0, 60)}...`);

    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, response.data);

    console.log(`   ✅ Image saved: ${filename}`);
    return `/uploads/news/${filename}`;
  } catch (error: any) {
    console.error(`   ❌ Failed to download image: ${error.message}`);
    return url; // Return original URL if download fails
  }
}

// Function to parse Russian date
function parseRussianDate(dateStr: string): Date {
  const months: { [key: string]: number } = {
    'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3,
    'мая': 4, 'июня': 5, 'июля': 6, 'августа': 7,
    'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11
  };

  // Parse format like "15 февраля 2024"
  const match = dateStr.match(/(\d+)\s+([а-я]+)\s+(\d{4})/i);
  if (match) {
    const day = parseInt(match[1]);
    const month = months[match[2].toLowerCase()];
    const year = parseInt(match[3]);
    return new Date(year, month, day);
  }

  return new Date();
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^а-яёa-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

// Determine category from title/content
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

// Main scraping function
async function scrapeAurvaNews() {
  try {
    console.log('🔍 Starting automated AURVA news scraping...\n');

    // Try to fetch directly from Tilda Feed API
    const feedUrl = 'https://feed.tildacdn.com/api/getfeed/?feeduid=390736647451&size=100&sort[date]=desc';

    console.log('📡 Fetching news from Tilda API...');

    let newsData: AurvaNewsItem[] = [];

    try {
      const response = await axios.get(feedUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Referer': 'https://aurva.kg/'
        }
      });

      if (response.data && response.data.posts) {
        console.log(`✅ Found ${response.data.posts.length} news articles from API\n`);

        newsData = response.data.posts.map((post: any) => ({
          title: post.title || '',
          excerpt: post.descr || post.text?.substring(0, 200) || '',
          content: post.text || post.descr || '',
          imageUrl: post.img || post.imgSmall || '',
          date: post.date || new Date().toISOString(),
          link: post.url || '',
          category: 'other'
        }));
      }
    } catch (apiError: any) {
      console.log('⚠️  Direct API access failed, trying alternative method...\n');

      // Fallback: Try to fetch the page HTML and extract feed config
      try {
        const pageResponse = await axios.get('https://aurva.kg/news', {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        // Look for feed configuration in the page
        const feedMatch = pageResponse.data.match(/feeduid['":\s]+['"]?(\d+)['"]?/);
        if (feedMatch) {
          console.log(`✅ Found feed ID: ${feedMatch[1]}`);
        }

        console.log('⚠️  Could not extract news automatically from HTML');
        console.log('📌 Manual extraction required - see instructions below\n');
        throw new Error('Automatic extraction not available');
      } catch (pageError) {
        throw new Error('Could not access aurva.kg');
      }
    }

    if (newsData.length === 0) {
      throw new Error('No news data found');
    }

    // Connect to database
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Sync models
    await sequelize.sync();

    // Clear existing news (optional - comment out if you want to keep old news)
    console.log('🗑️  Clearing existing news...');
    await News.destroy({ where: {} });
    console.log('✅ Cleared\n');

    console.log('💾 Importing news articles...\n');

    let successCount = 0;
    let failCount = 0;

    for (const [index, article] of newsData.entries()) {
      try {
        console.log(`[${index + 1}/${newsData.length}] ${article.title.substring(0, 60)}...`);

        // Download image if available
        let localImageUrl = article.imageUrl;
        if (article.imageUrl && article.imageUrl.startsWith('http')) {
          const imageExt = article.imageUrl.match(/\.(jpg|jpeg|png|gif|webp)/i)?.[1] || 'jpg';
          const imageFilename = `news-${index + 1}-${Date.now()}.${imageExt}`;
          localImageUrl = await downloadImage(article.imageUrl, imageFilename);
        }

        // Parse date
        const publishedAt = parseRussianDate(article.date);

        // Generate slug
        const slug = generateSlug(article.title);

        // Determine category
        const category = determineCategory(article.title, article.excerpt);

        // Create news article
        const news = await News.create({
          title: article.title,
          slug: slug,
          excerpt: article.excerpt,
          content: article.content || article.excerpt,
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
    console.log('✅ AURVA News Import Completed!');
    console.log('═══════════════════════════════════════════');
    console.log(`✅ Success: ${successCount} articles`);
    console.log(`❌ Failed: ${failCount} articles`);
    console.log(`📰 Total in database: ${await News.count()}`);
    console.log('═══════════════════════════════════════════\n');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.log('\n═══════════════════════════════════════════');
    console.log('📋 MANUAL EXTRACTION INSTRUCTIONS');
    console.log('═══════════════════════════════════════════');
    console.log('1. Open: https://aurva.kg/news');
    console.log('2. Press F12 → Network tab');
    console.log('3. Filter: getfeed');
    console.log('4. Refresh page (F5)');
    console.log('5. Click on "getfeed" request');
    console.log('6. Copy Response JSON');
    console.log('7. Save as: aurva-news-manual.json');
    console.log('8. Run: npm run import:manual\n');

    process.exit(1);
  }
}

// Run the scraper
scrapeAurvaNews();
