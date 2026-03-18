import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import sequelize from '../config/database';
import { News } from '../models';

dotenv.config();

const FIRECRAWL_API_KEY = 'fc-4d0aa75670724a2ab95f0b76408e94a7';
const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v0/scrape';
const TILDA_FEED_URL = 'https://feed.tildacdn.com/api/getfeed/?feeduid=390736647451&size=100&sort[date]=desc';

interface TildaPost {
  title: string;
  descr?: string;
  text?: string;
  img?: string;
  imgSmall?: string;
  date: string;
  url?: string;
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

// Scrape URL with Firecrawl
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

// Fetch Tilda Feed through Firecrawl as proxy
async function fetchTildaFeed(): Promise<TildaPost[]> {
  try {
    console.log('📡 Fetching Tilda Feed API via Firecrawl...');

    // Use Firecrawl to fetch the API
    const response = await axios.post(
      FIRECRAWL_API_URL,
      {
        url: TILDA_FEED_URL,
        formats: ['html']
      },
      {
        headers: {
          'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (response.data.success && response.data.data) {
      // Parse JSON from response
      const jsonMatch = response.data.data.html.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        if (data.posts && Array.isArray(data.posts)) {
          console.log(`✅ Found ${data.posts.length} posts from Tilda Feed\n`);
          return data.posts;
        }
      }
    }

    throw new Error('Failed to parse Tilda feed');
  } catch (error: any) {
    console.error('❌ Firecrawl fetch failed:', error.message);
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

  const matchDots = dateStr.match(/(\d+)\.(\d+)\.(\d{4})/);
  if (matchDots) {
    return new Date(parseInt(matchDots[3]), parseInt(matchDots[2]) - 1, parseInt(matchDots[1]));
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

// Main hybrid import
async function hybridImport() {
  try {
    console.log('═══════════════════════════════════════════');
    console.log('🔥 HYBRID FIRECRAWL IMPORT - AURVA NEWS');
    console.log('═══════════════════════════════════════════\n');

    // Step 1: Get post list from Tilda Feed
    const posts = await fetchTildaFeed();

    if (posts.length === 0) {
      throw new Error('No posts found');
    }

    // Filter posts with URLs
    const postsWithUrls = posts.filter(p => p.url);
    console.log(`📋 Posts with URLs: ${postsWithUrls.length}\n`);

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

    console.log('📰 Step 2: Scraping articles with Firecrawl...\n');

    let successCount = 0;
    let failCount = 0;

    for (const [index, post] of postsWithUrls.entries()) {
      try {
        if (!post.url) continue;

        console.log(`[${index + 1}/${postsWithUrls.length}] ${post.title.substring(0, 50)}...`);
        console.log(`   🔗 ${post.url}`);

        // Scrape with Firecrawl
        const result = await scrapeWithFirecrawl(post.url);

        if (!result.success || !result.data) {
          throw new Error('Firecrawl failed');
        }

        const { markdown } = result.data;

        // Save markdown
        const slug = generateSlug(post.title);
        const mdPath = path.join(mdDir, `${slug}.md`);
        fs.writeFileSync(mdPath, markdown, 'utf-8');
        console.log(`   💾 Saved: ${slug}.md`);

        // Download image
        let featuredImage = post.img || post.imgSmall || '';
        if (featuredImage && featuredImage.startsWith('http')) {
          const ext = featuredImage.match(/\.(jpg|jpeg|png|gif|webp)/i)?.[1] || 'jpg';
          const filename = `${slug}-${index + 1}.${ext}`;
          featuredImage = await downloadImage(featuredImage, filename);
          console.log(`   🖼️  Image: ${filename}`);
        }

        // Parse date
        const publishedAt = parseRussianDate(post.date);

        // Create excerpt
        const excerpt = (post.descr || post.text || markdown)
          .replace(/[#*_\[\]()]/g, '')
          .substring(0, 200)
          .trim();

        // Determine category
        const category = determineCategory(post.title, markdown);

        // Create news entry
        const news = await News.create({
          title: post.title,
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
        await new Promise(resolve => setTimeout(resolve, 3000));

      } catch (error: any) {
        console.error(`   ❌ Failed: ${error.message}\n`);
        failCount++;
      }
    }

    console.log('═══════════════════════════════════════════');
    console.log('✅ HYBRID IMPORT COMPLETED!');
    console.log('═══════════════════════════════════════════');
    console.log(`✅ Success: ${successCount} articles`);
    console.log(`❌ Failed: ${failCount} articles`);
    console.log(`📰 Total in DB: ${await News.count()}`);
    console.log(`💾 Markdown files: ${mdDir}`);
    console.log('═══════════════════════════════════════════\n');

    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ Fatal Error:', error.message);
    process.exit(1);
  }
}

hybridImport();
