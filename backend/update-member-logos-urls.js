const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Official logo URLs from company websites
const logoUrls = {
  'bithub': 'https://bithub.kg/_nuxt/logo.f85dfeaa.svg',
  'envoys': 'https://envoys.vision/white-logo.svg',
  'kln': 'https://kln.kg/wp-content/themes/kln-theme/public/images/svg/logo.765b44.svg',
  'royal-inc': 'https://cdn.prod.website-files.com/65df0c677a5b8c6b9bf82e7b/65e8615d40079fc76ed48d06_5740889.png'
};

async function updateMemberLogos() {
  console.log('🔄 Updating member logos with official URLs...\n');

  for (const [slug, logoUrl] of Object.entries(logoUrls)) {
    try {
      console.log(`📋 Updating ${slug}...`);

      // Get member
      const { data: member, error: fetchError } = await supabase
        .from('members')
        .select('id, name')
        .eq('slug', slug)
        .single();

      if (fetchError || !member) {
        console.log(`   ❌ Member not found: ${slug}`);
        continue;
      }

      console.log(`   🔍 Member: ${member.name} (ID: ${member.id})`);
      console.log(`   🔗 New logo URL: ${logoUrl}`);

      // Update logo URL
      const { error: updateError } = await supabase
        .from('members')
        .update({ logo_url: logoUrl })
        .eq('id', member.id);

      if (updateError) {
        console.error(`   ❌ Update error: ${updateError.message}`);
      } else {
        console.log(`   ✅ Logo URL updated successfully`);
      }

      console.log('');

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
    }
  }

  console.log('🎉 Logo update completed!');
}

updateMemberLogos().catch(console.error);
