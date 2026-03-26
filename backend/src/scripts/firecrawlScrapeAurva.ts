import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import sequelize from '../config/database';
import { News } from '../models';

dotenv.config();

const FIRECRAWL_API_KEY = 'fc-4d0aa75670724a2ab95f0b76408e94a7';
const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v0/scrape';

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

// Function to scrape URL with Firecrawl
async function scrapeWithFirecrawl(url: string): Promise<FirecrawlResponse> {
  try {
    console.log(`   🔥 Firecrawl scraping: ${url}`);

    const response = await axios.post(
      FIRECRAWL_API_URL,
      {
        url: url,
        formats: ['markdown', 'html'],
        onlyMainContent: true,
        includeTags: ['article', 'main', 'img'],
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
    console.error(`   ❌ Firecrawl error:`, error.response?.data || error.message);
    throw error;
  }
}

// Function to download image
async function downloadImage(url: string, filename: string): Promise<string> {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'news');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    console.log(`   ⬇️  Downloading image: ${url.substring(0, 50)}...`);

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

// Main function to scrape single page
async function scrapeSinglePage(url: string) {
  try {
    console.log('═══════════════════════════════════════════');
    console.log('🔥 FIRECRAWL AURVA NEWS SCRAPER');
    console.log('═══════════════════════════════════════════\n');

    console.log('📄 Scraping page:', url, '\n');

    // Scrape with Firecrawl
    const result = await scrapeWithFirecrawl(url);

    if (!result.success || !result.data) {
      throw new Error('Firecrawl scraping failed');
    }

    const { markdown, metadata } = result.data;

    console.log('\n✅ Scraping successful!');
    console.log('📰 Title:', metadata.title);
    console.log('📝 Content length:', markdown.length, 'chars\n');

    // Save markdown to file
    const mdDir = path.join(process.cwd(), 'scraped-news');
    if (!fs.existsSync(mdDir)) {
      fs.mkdirSync(mdDir, { recursive: true });
    }

    const slug = generateSlug(metadata.title);
    const mdPath = path.join(mdDir, `${slug}.md`);

    fs.writeFileSync(mdPath, markdown, 'utf-8');
    console.log('💾 Markdown saved:', mdPath);

    // Extract images
    const images = extractImages(markdown);
    console.log(`🖼️  Found ${images.length} images\n`);

    // Download first image as featured image
    let featuredImage = metadata.ogImage || images[0] || '';
    if (featuredImage && featuredImage.startsWith('http')) {
      const ext = featuredImage.match(/\.(jpg|jpeg|png|gif|webp)/i)?.[1] || 'jpg';
      const filename = `${slug}-featured.${ext}`;
      featuredImage = await downloadImage(featuredImage, filename);
    }

    // Connect to database
    console.log('\n🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected\n');
    await sequelize.sync();

    // Create excerpt (first 200 chars)
    const excerpt = markdown
      .replace(/[#*_\[\]()]/g, '')
      .substring(0, 200)
      .trim();

    // Determine category
    const category = determineCategory(metadata.title, markdown);

    // Create news entry
    const news = await News.create({
      title: metadata.title,
      slug: slug,
      excerpt: excerpt,
      content: markdown,
      category: category,
      imageUrl: featuredImage,
      published: true,
      publishedAt: new Date(),
      views: Math.floor(Math.random() * 100) + 50
    });

    console.log('═══════════════════════════════════════════');
    console.log('✅ NEWS IMPORTED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════');
    console.log(`📰 ID: ${news.id}`);
    console.log(`📝 Title: ${metadata.title}`);
    console.log(`📂 Category: ${category}`);
    console.log(`🖼️  Image: ${featuredImage}`);
    console.log(`💾 Markdown: ${mdPath}`);
    console.log('═══════════════════════════════════════════\n');

    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.response?.data) {
      console.error('API Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Get URL from command line or use default
const targetUrl = process.argv[2] || 'https://aurva.kg/tpost/zz95blxj01-vtoroi-potok-obucheniya-buhgalterov';

scrapeSinglePage(targetUrl);
