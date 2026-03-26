const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const STORAGE_BUCKET = process.env.STORAGE_BUCKET || 'uploads';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const IMAGES_DIR = path.join(__dirname, 'public', 'uploads', 'news');

// News that have multiple images
const newsWithGallery = {
  'второй-поток-обучения-бухгалтеров': [
    'второй-поток-обучения-бухгалтеров-1.jpeg',
    'второй-поток-обучения-бухгалтеров-2.jpeg',
    'второй-поток-обучения-бухгалтеров-featured.jpeg'
  ]
};

function generateUniqueFilename(originalName, fileExt) {
  const hash = crypto.createHash('md5').update(originalName).digest('hex').substring(0, 8);
  const timestamp = Date.now();
  return `news-gallery-${hash}-${timestamp}${fileExt}`;
}

async function uploadGalleryImages() {
  console.log('📸 Uploading news gallery images...\n');

  for (const [slug, imageFiles] of Object.entries(newsWithGallery)) {
    console.log(`\n📰 Processing news: ${slug}`);

    // Get news ID
    const { data: newsData, error: newsError } = await supabase
      .from('news')
      .select('id')
      .eq('slug', slug)
      .single();

    if (newsError || !newsData) {
      console.log(`   ❌ News not found: ${slug}`);
      continue;
    }

    const newsId = newsData.id;
    console.log(`   🔍 News ID: ${newsId}`);

    // Upload each image
    for (let i = 0; i < imageFiles.length; i++) {
      const imageFile = imageFiles[i];
      const imagePath = path.join(IMAGES_DIR, imageFile);

      if (!fs.existsSync(imagePath)) {
        console.log(`   ⚠️  Image not found: ${imageFile}`);
        continue;
      }

      try {
        const fileBuffer = fs.readFileSync(imagePath);
        const fileExt = path.extname(imageFile).toLowerCase();
        const uniqueFilename = generateUniqueFilename(imageFile, fileExt);
        const fileName = `news/${uniqueFilename}`;

        console.log(`   📤 Uploading: ${imageFile}`);

        // Upload to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(fileName, fileBuffer, {
            contentType: 'image/jpeg',
            upsert: false
          });

        if (uploadError) {
          console.error(`   ❌ Upload error: ${uploadError.message}`);
          continue;
        }

        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`;
        console.log(`   ✅ Uploaded to storage`);

        // Add to news_images table
        const { error: insertError } = await supabase
          .from('news_images')
          .insert({
            news_id: newsId,
            image_url: publicUrl,
            display_order: i + 1
          });

        if (insertError) {
          console.error(`   ❌ Database insert error: ${insertError.message}`);
        } else {
          console.log(`   ✅ Added to news_images (order: ${i + 1})`);
        }

        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
      }
    }
  }

  console.log('\n🎉 Gallery upload completed!');
}

uploadGalleryImages().catch(console.error);
