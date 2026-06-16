// BUG-2 fix: 4 members (bithub, envoys, royal, kln) have corrupted descriptions
// (U+FFFD mojibake, original text irrecoverable). Public site doesn't render member
// descriptions, so this is admin-only cosmetic. Replace garbage with clean neutral
// placeholders; owner can refine in the (now-working) admin form.
// Only touches rows whose description currently contains the replacement char.
// Run: node fixMemberDescriptions.js          (dry run)
//      node fixMemberDescriptions.js --commit  (write)
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY);
const COMMIT = process.argv.includes('--commit');

const CLEAN = {
  bithub: 'Участник Ассоциации AURVA, работающий в сфере цифровых активов и криптовалют в Кыргызстане.',
  envoys: 'Участник Ассоциации AURVA, развивающий проекты в сфере Web3 и блокчейн-технологий.',
  'royal-inc': 'Участник Ассоциации AURVA в сфере цифровых финансов и виртуальных активов.',
  kln: 'Участник Ассоциации AURVA, предоставляющий услуги в сфере виртуальных активов и финансовых технологий.',
};

(async () => {
  const { data } = await sb.from('members').select('id, slug, description');
  const broken = (data || []).filter(m => (m.description || '').includes('�'));
  console.log(`Found ${broken.length} members with corrupted descriptions:`);
  for (const m of broken) {
    const clean = CLEAN[m.slug];
    console.log(`  ${m.slug}: ${clean ? '-> "' + clean.slice(0, 50) + '..."' : 'NO CLEAN TEXT MAPPED (skip)'}`);
    if (COMMIT && clean) {
      const { error } = await sb.from('members').update({ description: clean }).eq('id', m.id);
      console.log(error ? `    ! ${error.message}` : '    ✓ updated');
    }
  }
  if (!COMMIT) console.log('\nDRY RUN. Re-run with --commit to write.');
})();
