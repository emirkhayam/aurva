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

const REAL_IMAGES_DIR = path.join(__dirname, 'public', 'uploads', 'news');

// Extract slug from filename (remove timestamp)
function extractSlugFromFilename(filename) {
  // Remove extension
  const withoutExt = filename.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/, '');

  // Remove timestamp pattern (e.g., -1772632436668)
  const slug = withoutExt.replace(/-\d{13}$/, '');

  return slug;
}

// Upload image to Supabase Storage
async function uploadImageToStorage(imagePath, slug) {
  try {
    const fileBuffer = fs.readFileSync(imagePath);
    const fileExt = path.extname(imagePath).toLowerCase();
    const fileName = `news/${slug}${fileExt}`;

    console.log(`   📸 Uploading: ${path.basename(imagePath)} → ${fileName}`);

    // Delete old file if exists
    const { data: existingFiles } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list('news', { search: slug });

    if (existingFiles && existingFiles.length > 0) {
      for (const file of existingFiles) {
        await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([`news/${file.name}`]);
      }
    }

    // Determine content type
    let contentType = 'image/jpeg';
    if (fileExt === '.png') {
      contentType = 'image/png';
    } else if (fileExt === '.jpg' || fileExt === '.jpeg') {
      contentType = 'image/jpeg';
    }

    // Upload new file
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, fileBuffer, {
        contentType: contentType,
        upsert: true
      });

    if (error) {
      console.error(`   ❌ Error uploading: ${error.message}`);
      return null;
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`;
    console.log(`   ✅ Uploaded: ${fileName}`);
    return { slug, url: publicUrl };

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

// Update news with image URL
async function updateNewsImage(slug, imageUrl) {
  try {
    const { data, error } = await supabase
      .from('news')
      .update({ image_url: imageUrl })
      .eq('slug', slug);

    if (error) {
      throw new Error(error.message);
    }

    console.log(`   ✅ Updated news: ${slug}`);
    return true;

  } catch (error) {
    console.error(`   ❌ Error updating news ${slug}:`, error.message);
    return false;
  }
}

// Main function
async function uploadAllRealImages() {
  console.log('🚀 Uploading REAL news images to Supabase Storage...\n');

  // Check if directory exists
  if (!fs.existsSync(REAL_IMAGES_DIR)) {
    console.error(`❌ Directory not found: ${REAL_IMAGES_DIR}`);
    process.exit(1);
  }

  // Get all image files
  const files = fs.readdirSync(REAL_IMAGES_DIR).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.jpg', '.jpeg', '.png'].includes(ext) &&
           !f.startsWith('article-') &&
           !f.startsWith('image-');
  });

  console.log(`📸 Found ${files.length} REAL image files\n`);

  let uploaded = 0;
  let updated = 0;
  let errors = 0;

  for (const file of files) {
    try {
      console.log(`\n📰 Processing: ${file}`);

      const imagePath = path.join(REAL_IMAGES_DIR, file);
      const slug = extractSlugFromFilename(file);

      console.log(`   🔍 Extracted slug: ${slug}`);

      // Upload to storage
      const result = await uploadImageToStorage(imagePath, slug);

      if (result) {
        uploaded++;

        // Update news in database
        const updateSuccess = await updateNewsImage(result.slug, result.url);
        if (updateSuccess) {
          updated++;
        } else {
          errors++;
        }
      } else {
        errors++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
      errors++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 Upload Summary:`);
  console.log(`   ✅ Uploaded to Storage: ${uploaded}`);
  console.log(`   ✅ Updated in Database: ${updated}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📝 Total: ${files.length}`);
  console.log(`${'='.repeat(60)}\n`);

  console.log('🎉 REAL images uploaded successfully!');
}

// Run upload
uploadAllRealImages().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
