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

const IMAGES_DIR = path.join(__dirname, 'uploads', 'news');

// Upload image to Supabase Storage
async function uploadImageToStorage(imagePath) {
  try {
    const fileBuffer = fs.readFileSync(imagePath);
    const fileName = `news/${path.basename(imagePath)}`;
    const fileExt = path.extname(imagePath).toLowerCase();

    // Check if file already exists
    const { data: existingFiles } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list('news', { search: path.basename(imagePath) });

    if (existingFiles && existingFiles.length > 0) {
      console.log(`   ⏭️  Image already exists: ${fileName}`);
      return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`;
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
        upsert: false
      });

    if (error) {
      console.error(`   ❌ Error uploading image: ${error.message}`);
      return null;
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`;
    console.log(`   ✅ Uploaded: ${fileName}`);
    return publicUrl;

  } catch (error) {
    console.error(`   ❌ Error uploading ${path.basename(imagePath)}: ${error.message}`);
    return null;
  }
}

// Main function
async function uploadAllImages() {
  console.log('🚀 Starting image upload to Supabase Storage...\n');

  // Check if directory exists
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`❌ Directory not found: ${IMAGES_DIR}`);
    process.exit(1);
  }

  // Get all image files
  const files = fs.readdirSync(IMAGES_DIR).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.jpg', '.jpeg', '.png'].includes(ext);
  });

  console.log(`📸 Found ${files.length} image files\n`);

  let uploaded = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    try {
      const imagePath = path.join(IMAGES_DIR, file);
      const result = await uploadImageToStorage(imagePath);

      if (result) {
        if (result.includes('already exists')) {
          skipped++;
        } else {
          uploaded++;
        }
      } else {
        errors++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
      errors++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 Upload Summary:`);
  console.log(`   ✅ Uploaded: ${uploaded}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📝 Total: ${files.length}`);
  console.log(`${'='.repeat(60)}\n`);

  console.log('🎉 Upload completed!');
}

// Run upload
uploadAllImages().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
