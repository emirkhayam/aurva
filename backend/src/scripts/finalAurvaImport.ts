import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import sequelize from '../config/database';
import { News } from '../models';

dotenv.config();

const FIRECRAWL_API_KEY = 'fc-4d0aa75670724a2ab95f0b76408e94a7';
const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v1/scrape';
const FIRECRAWL_MAP_URL = 'https://api.firecrawl.dev/v1/map';

interface FirecrawlResponse {
  success: boolean;
  data?: {
    markdown: string;
    html?: string;
    metadata?: {
      title: string;
      description?: string;
      ogImage?: string;
      sourceURL: string;
    };
  };
  error?: string;
}

// Get all URLs from site using Firecrawl Map
async function getNewsUrls(): Promise<string[]> {
  try {
    console.log('🗺️  Mapping aurva.kg/news to find all article URLs...\n');

    const response = await axios.post(
      FIRECRAWL_MAP_URL,
      {
        url: 'https://aurva.kg/news',
        search: 'Find all news article links',
        limit: 100
      },
      {
        headers: {
          'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    if (response.data.success && response.data.links) {
      // Filter for tpost URLs (actual articles)
      const newsUrls = response.data.links
        .filter((link: string) => link.includes('/tpost/'))
        .filter((link: string, index: number, self: string[]) => self.indexOf(link) === index);

      console.log(`✅ Found ${newsUrls.length} unique article URLs\n`);
      return newsUrls;
    }

    return [];
  } catch (error: any) {
    console.error('❌ Map API error:', error.response?.data || error.message);
    throw error;
  }
}

// Scrape article with Firecrawl v1
async function scrapeArticle(url: string): Promise<FirecrawlResponse> {
  try {
    const response = await axios.post(
      FIRECRAWL_API_URL,
      {
        url: url,
        formats: ['markdown', 'html']
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
    console.error(`❌ Scrape error:`, error.response?.data || error.message);
    throw error;
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, response.data);
    return `/uploads/news/${filename}`;
  } catch (error: any) {
    console.error(`   ⚠️  Image download failed: ${error.message}`);
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

  // Format: DD.MM.YYYY
  const match = dateStr.match(/(\d+)\.(\d+)\.(\d{4})/);
  if (match) {
    return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
  }

  // Format: DD месяц YYYY
  const matchRu = dateStr.match(/(\d+)\s+([а-я]+)\s+(\d{4})/i);
  if (matchRu) {
    const day = parseInt(matchRu[1]);
    const month = months[matchRu[2].toLowerCase()];
    const year = parseInt(matchRu[3]);
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

// Extract images from markdown
function extractImages(markdown: string): string[] {
  const imageRegex = /!\[.*?\]\((https?:\/\/[^\)]+)\)/g;
  const images: string[] = [];
  let match;

  while ((match = imageRegex.exec(markdown)) !== null) {
    images.push(match[1]);
  }

  return images;
}

// Extract date from markdown
function extractDateFromMarkdown(markdown: string): string {
  // Try DD.MM.YYYY format
  const dateMatch = markdown.match(/(\d{2}\.\d{2}\.\d{4})/);
  if (dateMatch) return dateMatch[1];

  // Try Russian date format
  const ruDateMatch = markdown.match(/(\d+\s+[а-я]+\s+\d{4})/i);
  if (ruDateMatch) return ruDateMatch[1];

  return '';
}

// Main import function
async function finalImport() {
  try {
    console.log('═══════════════════════════════════════════');
    console.log('🔥 FINAL AURVA NEWS IMPORT - FIRECRAWL V1');
    console.log('═══════════════════════════════════════════\n');

    // Step 1: Get all article URLs
    const newsUrls = await getNewsUrls();

    if (newsUrls.length === 0) {
      console.log('⚠️  No articles found. Trying direct scraping...\n');

      // Fallback: Try direct scraping of news page
      const pageResult = await scrapeArticle('https://aurva.kg/news');
      if (pageResult.success && pageResult.data) {
        const markdown = pageResult.data.markdown;
        const urlMatches = markdown.matchAll(/https:\/\/aurva\.kg\/tpost\/[^\s\)]+/g);
        const urls = Array.from(urlMatches, m => m[0]);
        newsUrls.push(...urls.filter((url, index, self) => self.indexOf(url) === index));
        console.log(`✅ Extracted ${newsUrls.length} URLs from page content\n`);
      }
    }

    if (newsUrls.length === 0) {
      throw new Error('No article URLs found');
    }

    // Preview URLs
    console.log('📋 Preview of article URLs:');
    newsUrls.slice(0, 5).forEach((url, i) => {
      console.log(`   ${i + 1}. ${url}`);
    });
    console.log('');

    // Connect to database
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected\n');
    await sequelize.sync();

    // Clear existing news
    console.log('🗑️  Clearing existing news...');
    await News.destroy({ where: {} });
    console.log('✅ Cleared\n');

    // Create directories
    const mdDir = path.join(process.cwd(), 'scraped-news');
    if (!fs.existsSync(mdDir)) {
      fs.mkdirSync(mdDir, { recursive: true });
    }

    console.log('📰 Step 2: Scraping and importing articles...\n');

    let successCount = 0;
    let failCount = 0;

    for (const [index, url] of newsUrls.entries()) {
      try {
        console.log(`[${index + 1}/${newsUrls.length}] ${url.substring(0, 70)}...`);

        const result = await scrapeArticle(url);

        if (!result.success || !result.data) {
          throw new Error('Failed to scrape article');
        }

        const { markdown, metadata } = result.data;
        const title = metadata?.title || 'Без заголовка';

        console.log(`   ✅ Title: ${title}`);

        // Save markdown
        const slug = generateSlug(title);
        const mdPath = path.join(mdDir, `${slug}.md`);
        fs.writeFileSync(mdPath, markdown, 'utf-8');

        // Extract and download images
        const images = extractImages(markdown);
        let featuredImage = metadata?.ogImage || images[0] || '';

        if (featuredImage && featuredImage.startsWith('http')) {
          const ext = featuredImage.match(/\.(jpg|jpeg|png|gif|webp)/i)?.[1] || 'jpg';
          const filename = `${slug}-${Date.now()}.${ext}`;
          featuredImage = await downloadImage(featuredImage, filename);
          console.log(`   🖼️  Image: ${filename}`);
        }

        // Extract date
        const dateStr = extractDateFromMarkdown(markdown);
        const publishedAt = dateStr ? parseRussianDate(dateStr) : new Date();
        console.log(`   📅 Date: ${publishedAt.toLocaleDateString('ru-RU')}`);

        // Create excerpt
        const excerpt = markdown
          .replace(/[#*_\[\]()]/g, '')
          .replace(/Log In To Your Account[\s\S]*?Новости/g, '')
          .replace(/\s+/g, ' ')
          .substring(0, 200)
          .trim();

        // Determine category
        const category = determineCategory(title, markdown);

        // Create news entry
        const news = await News.create({
          title: title,
          slug: slug,
          excerpt: excerpt || title.substring(0, 200),
          content: markdown,
          category: category,
          imageUrl: featuredImage,
          published: true,
          publishedAt: publishedAt,
          views: Math.floor(Math.random() * 500) + 100
        });

        console.log(`   ✅ Imported (ID: ${news.id}, Category: ${category})\n`);
        successCount++;

        // Delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error: any) {
        console.error(`   ❌ Failed: ${error.message}\n`);
        failCount++;
      }
    }

    console.log('═══════════════════════════════════════════');
    console.log('✅ IMPORT COMPLETED!');
    console.log('═══════════════════════════════════════════');
    console.log(`✅ Success: ${successCount} articles`);
    console.log(`❌ Failed: ${failCount} articles`);
    console.log(`📰 Total in DB: ${await News.count()}`);
    console.log(`💾 Markdown files: ${mdDir}`);
    console.log('═══════════════════════════════════════════\n');

    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ Fatal Error:', error.message);
    if (error.response?.data) {
      console.error('API Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

finalImport();
