const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const STORAGE_BUCKET = process.env.STORAGE_BUCKET || 'uploads';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const SCRAPED_NEWS_DIR = path.join(__dirname, 'scraped-news');
const IMAGES_DIR = path.join(__dirname, 'uploads', 'news');

// Helper to generate slug from filename
function generateSlug(filename) {
  return filename.replace('.md', '');
}

// Helper to clean content from markdown
function cleanMarkdownContent(content) {
  // Remove login forms and social sharing links
  let cleaned = content
    .replace(/Log In To Your Account[\s\S]*?Log in/g, '')
    .replace(/\[Forgot password\?\][\s\S]*?\)/g, '')
    .replace(/- \[Facebook\][\s\S]*?\)/g, '')
    .replace(/- \[Twitter\][\s\S]*?\)/g, '')
    .replace(/!\[\]\(https:\/\/static\.tildacdn\.com[\s\S]*?\)/g, '')
    .replace(/Новости\n\n/g, '');

  return cleaned.trim();
}

// Helper to parse markdown file
function parseMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const cleanedContent = cleanMarkdownContent(content);

  // Extract title (# heading)
  const titleMatch = cleanedContent.match(/^# (.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : path.basename(filePath, '.md');

  // Extract date (DD.MM.YYYY format at the end)
  const dateMatch = cleanedContent.match(/(\d{2}\.\d{2}\.\d{4})\s*$/);
  let publishedAt = new Date();

  if (dateMatch) {
    const [day, month, year] = dateMatch[1].split('.');
    publishedAt = new Date(`${year}-${month}-${day}`);
  }

  // Extract excerpt (first paragraph after title)
  const paragraphs = cleanedContent.split('\n\n').filter(p =>
    p.trim() &&
    !p.startsWith('#') &&
    !p.startsWith('![') &&
    !p.startsWith('|') &&
    !p.match(/^\d{2}\.\d{2}\.\d{4}$/)
  );

  const excerpt = paragraphs[0] ? paragraphs[0].replace(/\*\*/g, '').replace(/\n/g, ' ').substring(0, 200) : '';

  // Determine category from keywords
  let category = 'other';
  const lowerContent = cleanedContent.toLowerCase();

  if (lowerContent.includes('меморандум') || lowerContent.includes('регулир') || lowerContent.includes('закон')) {
    category = 'regulation';
  } else if (lowerContent.includes('обучение') || lowerContent.includes('встреча') || lowerContent.includes('форум') || lowerContent.includes('конференц')) {
    category = 'events';
  } else if (lowerContent.includes('итоги') || lowerContent.includes('аналитик') || lowerContent.includes('отчет')) {
    category = 'analytics';
  }

  return {
    title: title,
    slug: generateSlug(path.basename(filePath)),
    excerpt: excerpt.trim(),
    content: cleanedContent.trim(),
    category,
    published_at: publishedAt.toISOString(),
    published: true,
    views: 0
  };
}

// Helper to find image for news article
function findImageForNews(slug) {
  const possibleExtensions = ['.jpeg', '.jpg', '.png', '.PNG', '.JPG', '.JPEG'];

  for (const ext of possibleExtensions) {
    const imagePath = path.join(IMAGES_DIR, `${slug}${ext}`);
    if (fs.existsSync(imagePath)) {
      return imagePath;
    }

    // Try with pattern matching
    const files = fs.readdirSync(IMAGES_DIR);
    const matchingFile = files.find(f => {
      const fileWithoutExt = f.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/, '');
      const slugWithoutExt = slug.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/, '');
      return fileWithoutExt === slugWithoutExt || fileWithoutExt.startsWith(slugWithoutExt);
    });

    if (matchingFile) {
      return path.join(IMAGES_DIR, matchingFile);
    }
  }

  return null;
}

// Upload image to Supabase Storage
async function uploadImageToStorage(imagePath, slug) {
  try {
    const fileBuffer = fs.readFileSync(imagePath);
    const fileExt = path.extname(imagePath);
    const fileName = `news/${slug}${fileExt}`;

    // Check if file already exists
    const { data: existingFiles } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list('news', { search: `${slug}${fileExt}` });

    if (existingFiles && existingFiles.length > 0) {
      console.log(`   ⏭️  Image already exists: ${fileName}`);
      return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`;
    }

    // Upload new file
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, fileBuffer, {
        contentType: `image/${fileExt.replace('.', '')}`,
        upsert: false
      });

    if (error) {
      console.error(`   ❌ Error uploading image: ${error.message}`);
      return null;
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`;
    console.log(`   ✅ Uploaded image: ${fileName}`);
    return publicUrl;

  } catch (error) {
    console.error(`   ❌ Error uploading image: ${error.message}`);
    return null;
  }
}

// Main import function
async function importAllNews() {
  console.log('🚀 Starting news import to Supabase...\n');

  // Check connection
  const { data: healthCheck, error: healthError } = await supabase
    .from('news')
    .select('count', { count: 'exact', head: true });

  if (healthError) {
    console.error('❌ Failed to connect to Supabase:', healthError.message);
    process.exit(1);
  }

  console.log('✅ Connected to Supabase successfully\n');

  // Read all markdown files
  if (!fs.existsSync(SCRAPED_NEWS_DIR)) {
    console.error(`❌ Directory not found: ${SCRAPED_NEWS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(SCRAPED_NEWS_DIR).filter(f => f.endsWith('.md'));
  console.log(`📄 Found ${files.length} markdown files\n`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    try {
      console.log(`\n📰 Processing: ${file}`);
      const filePath = path.join(SCRAPED_NEWS_DIR, file);
      const newsData = parseMarkdownFile(filePath);

      // Check if already exists
      const { data: existing, error: checkError } = await supabase
        .from('news')
        .select('id, slug')
        .eq('slug', newsData.slug)
        .single();

      if (existing) {
        console.log(`   ⏭️  Skipped: ${newsData.title} (already exists)`);
        skipped++;
        continue;
      }

      // Find and upload image
      const imagePath = findImageForNews(newsData.slug);
      if (imagePath) {
        console.log(`   📸 Found image: ${path.basename(imagePath)}`);
        const imageUrl = await uploadImageToStorage(imagePath, newsData.slug);
        if (imageUrl) {
          newsData.image_url = imageUrl;
        }
      } else {
        console.log(`   ⚠️  No image found for: ${newsData.slug}`);
      }

      // Insert into database
      const { data: insertedNews, error: insertError } = await supabase
        .from('news')
        .insert([newsData])
        .select();

      if (insertError) {
        throw new Error(insertError.message);
      }

      console.log(`   ✅ Imported: ${newsData.title}`);
      imported++;

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`   ❌ Error importing ${file}:`, error.message);
      errors++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 Import Summary:`);
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📝 Total: ${files.length}`);
  console.log(`${'='.repeat(60)}\n`);

  console.log('🎉 Import completed!');
}

// Run import
importAllNews().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
