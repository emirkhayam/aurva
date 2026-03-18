const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const STORAGE_BUCKET = process.env.STORAGE_BUCKET || 'uploads';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function uploadLogo() {
  console.log('📤 Uploading AURVA logo...\n');

  const logoPath = path.join(__dirname, 'uploads', 'logos', 'logo-1772293405913-290326631.svg');

  try {
    const fileBuffer = fs.readFileSync(logoPath);

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload('logos/aurva-logo.svg', fileBuffer, {
        contentType: 'image/svg+xml',
        upsert: true
      });

    if (error) throw error;

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/logos/aurva-logo.svg`;
    console.log('✅ Logo uploaded!');
    console.log('🔗 URL:', publicUrl);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

uploadLogo();
