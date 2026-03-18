const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const STORAGE_BUCKET = process.env.STORAGE_BUCKET || 'uploads';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Map logo files to member slugs
const logoMapping = {
  'logo-1772293405913-290326631.svg': 'bithub',
  'logo-1772293623321-417640252.svg': 'envoys',
  'logo-1772293649027-192037829.svg': 'kln',
  'logo-1772293957712-422035917.svg': 'royal-inc'
};

async function uploadMemberLogos() {
  console.log('📤 Uploading member logos...\n');

  const logosDir = path.join(__dirname, 'uploads', 'logos');

  for (const [filename, memberSlug] of Object.entries(logoMapping)) {
    const logoPath = path.join(logosDir, filename);

    if (!fs.existsSync(logoPath)) {
      console.log(`   ⚠️  Logo not found: ${filename}`);
      continue;
    }

    try {
      console.log(`\n📋 Processing: ${memberSlug}`);

      // Get member ID
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('id, name')
        .eq('slug', memberSlug)
        .single();

      if (memberError || !memberData) {
        console.log(`   ❌ Member not found: ${memberSlug}`);
        continue;
      }

      console.log(`   🔍 Member: ${memberData.name} (ID: ${memberData.id})`);

      // Read file
      const fileBuffer = fs.readFileSync(logoPath);
      const fileName = `members/${memberSlug}-logo.svg`;

      console.log(`   📤 Uploading: ${filename}`);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, fileBuffer, {
          contentType: 'image/svg+xml',
          upsert: true
        });

      if (uploadError) {
        console.error(`   ❌ Upload error: ${uploadError.message}`);
        continue;
      }

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`;
      console.log(`   ✅ Uploaded to storage`);

      // Update member record
      const { error: updateError } = await supabase
        .from('members')
        .update({ logo_url: publicUrl })
        .eq('id', memberData.id);

      if (updateError) {
        console.error(`   ❌ Database update error: ${updateError.message}`);
      } else {
        console.log(`   ✅ Updated member record with logo URL`);
      }

      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n🎉 Logo upload completed!');
}

uploadMemberLogos().catch(console.error);
