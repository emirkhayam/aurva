const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://supabasekong-a048ksg80wksowg4s0skogcw.aurva.kg';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzM2OTgwODAwLAogICJleHAiOiAxODk0ODQ3MjAwCn0.VKs6L-QvTPjZ-vHZgMoG2pqSBCIjR3hKwfVjBLdPZWI';

const SCRAPED_NEWS_DIR = path.join(__dirname, 'scraped-news');
const IMAGES_DIR = path.join(__dirname, 'public', 'uploads', 'news');

// Helper to generate slug from filename
function generateSlug(filename) {
  return filename.replace('.md', '');
}

// Helper to parse markdown file
function parseMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Extract title (# heading)
  const titleMatch = content.match(/^# (.+)$/m);
  const title = titleMatch ? titleMatch[1] : path.basename(filePath, '.md');

  // Extract date (DD.MM.YYYY format at the end)
  const dateMatch = content.match(/(\d{2}\.\d{2}\.\d{4})\s*$/);
  let publishedAt = new Date();

  if (dateMatch) {
    const [day, month, year] = dateMatch[1].split('.');
    publishedAt = new Date(`${year}-${month}-${day}`);
  }

  // Extract excerpt (first paragraph after title)
  const paragraphs = content.split('\n\n').filter(p =>
    p.trim() &&
    !p.startsWith('#') &&
    !p.startsWith('![') &&
    !p.startsWith('|') &&
    !p.startsWith('Log In') &&
    !p.startsWith('[Facebook') &&
    !p.startsWith('- [Facebook')
  );

  const excerpt = paragraphs[0] ? paragraphs[0].replace(/\*\*/g, '').substring(0, 200) : '';

  // Determine category from keywords
  let category = 'other';
  const lowerContent = content.toLowerCase();

  if (lowerContent.includes('меморандум') || lowerContent.includes('регулир') || lowerContent.includes('закон')) {
    category = 'regulation';
  } else if (lowerContent.includes('обучение') || lowerContent.includes('встреча') || lowerContent.includes('форум') || lowerContent.includes('конференц')) {
    category = 'events';
  } else if (lowerContent.includes('итоги') || lowerContent.includes('аналитик') || lowerContent.includes('отчет')) {
    category = 'analytics';
  }

  return {
    title: title.trim(),
    slug: generateSlug(path.basename(filePath)),
    excerpt: excerpt.trim(),
    content: content.trim(),
    category,
    publishedAt: publishedAt.toISOString(),
    published: true
  };
}

// Helper to find image for news article
function findImageForNews(slug) {
  const possibleExtensions = ['.jpeg', '.jpg', '.png', '.PNG', '.JPG', '.JPEG'];

  for (const ext of possibleExtensions) {
    const imagePath = path.join(IMAGES_DIR, `${slug}${ext}`);
    if (fs.existsSync(imagePath)) {
      return `/uploads/news/${slug}${ext}`;
    }

    // Try with timestamp pattern
    const files = fs.readdirSync(IMAGES_DIR);
    const matchingFile = files.find(f => f.startsWith(slug) && possibleExtensions.some(e => f.endsWith(e)));
    if (matchingFile) {
      return `/uploads/news/${matchingFile}`;
    }
  }

  return null;
}

// Make API request to Supabase
function makeRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL);
    const protocol = url.protocol === 'https:' ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=representation'
      }
    };

    const req = protocol.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body || '[]'));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Main import function
async function importAllNews() {
  console.log('🚀 Starting news import...\n');

  // Read all markdown files
  const files = fs.readdirSync(SCRAPED_NEWS_DIR).filter(f => f.endsWith('.md'));
  console.log(`📄 Found ${files.length} markdown files\n`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    try {
      const filePath = path.join(SCRAPED_NEWS_DIR, file);
      const newsData = parseMarkdownFile(filePath);

      // Find image
      const imageUrl = findImageForNews(newsData.slug);
      if (imageUrl) {
        newsData.imageUrl = imageUrl;
      }

      // Check if already exists
      const existing = await makeRequest(`/rest/v1/news?slug=eq.${newsData.slug}`, 'GET');

      if (existing && existing.length > 0) {
        console.log(`⏭️  Skipped: ${newsData.title} (already exists)`);
        skipped++;
        continue;
      }

      // Insert into database
      await makeRequest('/rest/v1/news', 'POST', newsData);
      console.log(`✅ Imported: ${newsData.title}`);
      imported++;

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`❌ Error importing ${file}:`, error.message);
      errors++;
    }
  }

  console.log(`\n📊 Import Summary:`);
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📝 Total: ${files.length}`);
}

// Run import
importAllNews().catch(console.error);
