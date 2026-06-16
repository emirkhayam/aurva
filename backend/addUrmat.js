// One-off: add Urmat Myrzabekov to team_members (category leadership).
// Uploads local photo to Storage, inserts ONE row (no wipe). Idempotent on name.
// Run: node addUrmat.js          (dry run)
//      node addUrmat.js --commit (write)
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const BUCKET = process.env.STORAGE_BUCKET || 'uploads';
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY);
const COMMIT = process.argv.includes('--commit');

const PERSON = {
  name: 'Урмат Мырзабеков',
  position: 'Член Ассоциации',
  category: 'leadership',
  photoFile: 'C:/Users/alanb/Downloads/Урмат М.jpg',
  slug: 'urmat-myrzabekov',
};

(async () => {
  console.log(`Add [${PERSON.category}] ${PERSON.name} — ${PERSON.position}${COMMIT ? ' (COMMIT)' : ' (dry run)'}`);
  if (!fs.existsSync(PERSON.photoFile)) { console.log(`! photo not found: ${PERSON.photoFile}`); return; }

  // already present?
  const { data: dup } = await sb.from('team_members').select('id').eq('name', PERSON.name);
  if (dup && dup.length) { console.log(`! already exists (id ${dup.map(d => d.id).join(',')}). Aborting.`); return; }

  // place last among leadership
  const { data: lead } = await sb.from('team_members').select('display_order').eq('category', 'leadership');
  const order = (lead && lead.length ? Math.max(...lead.map(r => r.display_order || 0)) : 0) + 1;
  console.log(`display_order = ${order}`);

  if (!COMMIT) { console.log('\nDRY RUN. Re-run with --commit to write.'); return; }

  const ext = (path.extname(PERSON.photoFile).replace('.', '') || 'jpg').toLowerCase();
  const storagePath = `team/${PERSON.slug}.${ext}`;
  const buf = fs.readFileSync(PERSON.photoFile);
  const ct = ext.includes('png') ? 'image/png' : 'image/jpeg';
  const { error: upErr } = await sb.storage.from(BUCKET).upload(storagePath, buf, { contentType: ct, upsert: true });
  if (upErr) { console.log(`! upload fail:`, JSON.stringify(upErr), upErr); return; }
  const photoUrl = sb.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
  console.log(`uploaded -> ${photoUrl}`);

  const { error } = await sb.from('team_members').insert({
    name: PERSON.name, position: PERSON.position, category: PERSON.category,
    photo_url: photoUrl, is_active: true, display_order: order,
  });
  if (error) { console.log(`! insert fail: ${error.message}`); return; }
  console.log(`✓ added ${PERSON.name}`);
})();
