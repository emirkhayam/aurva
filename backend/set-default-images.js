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

// Available images in storage
const availableImages = [
  `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/news/article-1-1772628265443.jpg`,
  `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/news/article-2-1772628265979.jpg`,
  `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/news/article-3-1772628266111.jpg`,
  `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/news/article-4-1772628266240.jpg`,
  `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/news/article-5-1772628266369.jpg`,
  `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/news/article-6-1772628266496.jpg`,
];

async function setDefaultImages() {
  console.log('🚀 Setting default images for news without images...\n');

  try {
    // Get all news without images
    const { data: newsWithoutImages, error } = await supabase
      .from('news')
      .select('id, title, slug')
      .is('image_url', null);

    if (error) {
      throw new Error(error.message);
    }

    console.log(`📰 Found ${newsWithoutImages.length} news without images\n`);

    let updated = 0;
    let errors = 0;

    for (let i = 0; i < newsWithoutImages.length; i++) {
      const newsItem = newsWithoutImages[i];
      const randomImage = availableImages[i % availableImages.length];

      try {
        const { data, error: updateError } = await supabase
          .from('news')
          .update({ image_url: randomImage })
          .eq('id', newsItem.id);

        if (updateError) {
          throw new Error(updateError.message);
        }

        console.log(`✅ Updated: ${newsItem.title.substring(0, 50)}...`);
        updated++;

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 50));

      } catch (error) {
        console.error(`❌ Error updating ${newsItem.slug}:`, error.message);
        errors++;
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 Update Summary:`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📝 Total: ${newsWithoutImages.length}`);
    console.log(`${'='.repeat(60)}\n`);

    console.log('🎉 Default images set successfully!');

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

setDefaultImages();
