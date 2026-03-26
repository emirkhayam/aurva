const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function deleteBadNews() {
  console.log('🗑️  Finding bad news to delete...\n');

  try {
    // Get all news with empty or bad content
    const { data: allNews, error: fetchError } = await supabase
      .from('news')
      .select('id, title, slug, excerpt, content')
      .or('excerpt.eq.,content.like.%Tilda%');

    if (fetchError) throw fetchError;

    console.log(`📰 Found ${allNews.length} potentially bad news\n`);

    let deleted = 0;

    for (const news of allNews) {
      // Check if content is bad (contains Tilda error or is empty)
      const isBadContent =
        !news.excerpt ||
        news.excerpt.trim() === '' ||
        news.content.includes('Tilda') ||
        news.content.includes('logo404.png') ||
        news.content.length < 100;

      if (isBadContent) {
        console.log(`🗑️  Deleting: ${news.title} (ID: ${news.id})`);
        console.log(`   Reason: ${!news.excerpt ? 'Empty excerpt' : 'Bad content'}`);

        const { error: deleteError } = await supabase
          .from('news')
          .delete()
          .eq('id', news.id);

        if (deleteError) {
          console.error(`   ❌ Error deleting: ${deleteError.message}`);
        } else {
          console.log(`   ✅ Deleted successfully`);
          deleted++;
        }
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 Deletion Summary:`);
    console.log(`   ✅ Deleted: ${deleted}`);
    console.log(`   📝 Checked: ${allNews.length}`);
    console.log(`${'='.repeat(60)}\n`);

    console.log('🎉 Cleanup completed!');

  } catch (error) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  }
}

deleteBadNews();
