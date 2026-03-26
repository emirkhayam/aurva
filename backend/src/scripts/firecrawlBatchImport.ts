import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import sequelize from '../config/database';
import { News } from '../models';

dotenv.config();

const FIRECRAWL_API_KEY = 'fc-4d0aa75670724a2ab95f0b76408e94a7';
const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v0/scrape';

interface NewsUrl {
  url: string;
  title: string;
  date: string;
  img: string;
}

interface FirecrawlResponse {
  success: boolean;
  data?: {
    markdown: string;
    html: string;
    metadata: {
      title: string;
      description?: string;
      ogImage?: string;
      sourceURL: string;
    };
  };
  error?: string;
}

// Scrape with Firecrawl
async function scrapeWithFirecrawl(url: string): Promise<FirecrawlResponse> {
  try {
    const response = await axios.post(
      FIRECRAWL_API_URL,
      {
        url: url,
        formats: ['markdown'],
        onlyMainContent: true,
        includeTags: ['article', 'main'],
        waitFor: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message);
  }
}

// Download image
async function downloadImage(url: string, filename: string): Promise<string> {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'news');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, response.data);
    return `/uploads/news/${filename}`;
  } catch (error: any) {
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
    return new Date(parseInt(match[3]), months[match[2].toLowerCase()], parseInt(match[1]));
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
function determineCategory(title: string, content: string): 'regulation' | 'events' | 'analytics' | 'other' {
  const text = (title + ' ' + content).toLowerCase();

  if (text.includes('регулирован') || text.includes('закон') || text.includes('нацбанк') || text.includes('лицензи')) {
    return 'regulation';
  }
  if (text.includes('конференц') || text.includes('встреча') || text.includes('меропри') || text.includes('событи') || text.includes('обучен')) {
    return 'events';
  }
  if (text.includes('аналитик') || text.includes('отчет') || text.includes('исследован') || text.includes('статистик')) {
    return 'analytics';
  }

  return 'other';
}

// Main batch import
async function batchImport() {
  try {
    console.log('═══════════════════════════════════════════');
    console.log('🔥 FIRECRAWL BATCH IMPORT - AURVA NEWS');
    console.log('═══════════════════════════════════════════\n');

    // Check if URLs file exists
    const urlsFilePath = path.join(process.cwd(), 'aurva-news-urls.json');

    if (!fs.existsSync(urlsFilePath)) {
      console.error('❌ File not found: aurva-news-urls.json\n');
      console.log('═══════════════════════════════════════════');
      console.log('📋 INSTRUCTIONS:');
      console.log('═══════════════════════════════════════════');
      console.log('1. Open: GET-NEWS-URLS.html in your browser');
      console.log('2. Click "Получить список URL"');
      console.log('3. Move downloaded file to: backend/aurva-news-urls.json');
      console.log('4. Run: npm run import:firecrawl-batch\n');
      process.exit(1);
    }

    // Load URLs
    console.log('📂 Loading URLs from file...');
    const urlsContent = fs.readFileSync(urlsFilePath, 'utf-8');
    const newsUrls: NewsUrl[] = JSON.parse(urlsContent);
    console.log(`✅ Loaded ${newsUrls.length} URLs\n`);

    // Connect to database
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected\n');
    await sequelize.sync();

    // Clear existing news
    console.log('🗑️  Clearing existing news...');
    await News.destroy({ where: {} });
    console.log('✅ Cleared\n');

    // Create markdown directory
    const mdDir = path.join(process.cwd(), 'scraped-news');
    if (!fs.existsSync(mdDir)) {
      fs.mkdirSync(mdDir, { recursive: true });
    }

    console.log('📰 Scraping and importing articles...\n');

    let successCount = 0;
    let failCount = 0;

    for (const [index, newsUrl] of newsUrls.entries()) {
      try {
        console.log(`[${index + 1}/${newsUrls.length}] ${newsUrl.title.substring(0, 50)}...`);

        // Scrape with Firecrawl
        console.log(`   🔥 Firecrawl: ${newsUrl.url.substring(0, 60)}...`);
        const result = await scrapeWithFirecrawl(newsUrl.url);

        if (!result.success || !result.data) {
          throw new Error('Firecrawl failed');
        }

        const { markdown } = result.data;

        // Clean markdown (remove login forms, etc.)
        const cleanedMarkdown = markdown
          .replace(/Log In To Your Account[\s\S]*?Новости/g, '')
          .trim();

        // Save markdown
        const slug = generateSlug(newsUrl.title);
        const mdPath = path.join(mdDir, `${slug}.md`);
        fs.writeFileSync(mdPath, cleanedMarkdown, 'utf-8');
        console.log(`   💾 Saved: ${slug}.md`);

        // Download image
        let featuredImage = newsUrl.img || '';
        if (featuredImage && featuredImage.startsWith('http')) {
          const ext = featuredImage.match(/\.(jpg|jpeg|png|gif|webp)/i)?.[1] || 'jpg';
          const filename = `${slug}-${index + 1}.${ext}`;
          console.log(`   ⬇️  Downloading image...`);
          featuredImage = await downloadImage(featuredImage, filename);
        }

        // Parse date
        const publishedAt = parseRussianDate(newsUrl.date);

        // Create excerpt (first 200 chars of cleaned markdown)
        const excerpt = cleanedMarkdown
          .replace(/[#*_\[\]()]/g, '')
          .substring(0, 200)
          .trim();

        // Determine category
        const category = determineCategory(newsUrl.title, cleanedMarkdown);

        // Create news entry
        const news = await News.create({
          title: newsUrl.title,
          slug: slug,
          excerpt: excerpt,
          content: cleanedMarkdown,
          category: category,
          imageUrl: featuredImage,
          published: true,
          publishedAt: publishedAt,
          views: Math.floor(Math.random() * 500) + 100
        });

        console.log(`   ✅ Imported (ID: ${news.id}, Category: ${category})\n`);
        successCount++;

        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 3000));

      } catch (error: any) {
        console.error(`   ❌ Failed: ${error.message}\n`);
        failCount++;
      }
    }

    console.log('═══════════════════════════════════════════');
    console.log('✅ BATCH IMPORT COMPLETED!');
    console.log('═══════════════════════════════════════════');
    console.log(`✅ Success: ${successCount} articles`);
    console.log(`❌ Failed: ${failCount} articles`);
    console.log(`📰 Total in DB: ${await News.count()}`);
    console.log(`💾 Markdown files: ${mdDir}`);
    console.log('═══════════════════════════════════════════\n');

    // Delete URLs file
    fs.unlinkSync(urlsFilePath);
    console.log('🗑️  Deleted aurva-news-urls.json\n');

    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ Fatal Error:', error.message);
    process.exit(1);
  }
}

batchImport();
