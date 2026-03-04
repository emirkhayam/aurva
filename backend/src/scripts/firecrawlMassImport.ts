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
    links?: string[];
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
        formats: ['markdown', 'html', 'links'],
        onlyMainContent: true,
        includeTags: ['article', 'main', 'img', 'a'],
        waitFor: 3000
      },
      {
        headers: {
          'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 90000
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(`   ❌ Firecrawl error:`, error.response?.data || error.message);
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

  const match = dateStr.match(/(\d+)\.(\d+)\.(\d{4})/);
  if (match) {
    return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
  }

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
  const dateMatch = markdown.match(/(\d{2}\.\d{2}\.\d{4})/);
  return dateMatch ? dateMatch[1] : '';
}

// Main mass import function
async function massImportAurvaNews() {
  try {
    console.log('═══════════════════════════════════════════');
    console.log('🔥 FIRECRAWL MASS IMPORT - AURVA NEWS');
    console.log('═══════════════════════════════════════════\n');

    // Step 1: Scrape news listing page to get all article links
    console.log('📄 Step 1: Scraping news listing page...\n');
    const listingResult = await scrapeWithFirecrawl('https://aurva.kg/news');

    if (!listingResult.success || !listingResult.data) {
      throw new Error('Failed to scrape news listing');
    }

    // Extract all news article links
    const newsLinks = (listingResult.data.links || [])
      .filter(link => link.includes('/tpost/') && link.includes('aurva.kg'))
      .filter((link, index, self) => self.indexOf(link) === index); // Remove duplicates

    console.log(`✅ Found ${newsLinks.length} news article links\n`);

    if (newsLinks.length === 0) {
      console.log('⚠️  No article links found. Check the page structure.\n');
      process.exit(1);
    }

    // Show first 5 links as preview
    console.log('📋 Preview of links:');
    newsLinks.slice(0, 5).forEach((link, i) => {
      console.log(`   ${i + 1}. ${link}`);
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

    // Step 2: Scrape each article
    console.log('📰 Step 2: Scraping individual articles...\n');

    let successCount = 0;
    let failCount = 0;

    const mdDir = path.join(process.cwd(), 'scraped-news');
    if (!fs.existsSync(mdDir)) {
      fs.mkdirSync(mdDir, { recursive: true });
    }

    for (const [index, link] of newsLinks.entries()) {
      try {
        console.log(`[${index + 1}/${newsLinks.length}] ${link.substring(0, 70)}...`);

        const articleResult = await scrapeWithFirecrawl(link);

        if (!articleResult.success || !articleResult.data) {
          throw new Error('Failed to scrape article');
        }

        const { markdown, metadata } = articleResult.data;

        console.log(`   ✅ Title: ${metadata.title}`);

        // Save markdown
        const slug = generateSlug(metadata.title);
        const mdPath = path.join(mdDir, `${slug}.md`);
        fs.writeFileSync(mdPath, markdown, 'utf-8');

        // Extract images
        const images = extractImages(markdown);
        let featuredImage = metadata.ogImage || images[0] || '';

        // Download featured image
        if (featuredImage && featuredImage.startsWith('http')) {
          const ext = featuredImage.match(/\.(jpg|jpeg|png|gif|webp)/i)?.[1] || 'jpg';
          const filename = `${slug}-${index + 1}.${ext}`;
          featuredImage = await downloadImage(featuredImage, filename);
        }

        // Extract date
        const dateStr = extractDateFromMarkdown(markdown);
        const publishedAt = dateStr ? parseRussianDate(dateStr) : new Date();

        // Create excerpt
        const excerpt = markdown
          .replace(/[#*_\[\]()]/g, '')
          .replace(/Log In To Your Account[\s\S]*?Новости/g, '')
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
          publishedAt: publishedAt,
          views: Math.floor(Math.random() * 500) + 100
        });

        console.log(`   ✅ Imported (ID: ${news.id}, Category: ${category})\n`);
        successCount++;

        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error: any) {
        console.error(`   ❌ Failed: ${error.message}\n`);
        failCount++;
      }
    }

    console.log('═══════════════════════════════════════════');
    console.log('✅ MASS IMPORT COMPLETED!');
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

massImportAurvaNews();
