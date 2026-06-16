// Import association structure (team members) from aurva.kg/about into our Supabase.
// Photos downloaded from tildacdn -> our Storage (uploads/team/). Idempotent wipe+insert.
// Run: node importTeam.js          (dry run)
//      node importTeam.js --commit (write)
require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const BUCKET = process.env.STORAGE_BUCKET || 'uploads';
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY);
const COMMIT = process.argv.includes('--commit');

const TEAM = [
  // --- Структура Ассоциации (leadership) ---
  { name: 'Темир Казыбай', position: 'Председатель Ассоциации', category: 'leadership', photo: 'https://static.tildacdn.one/tild6532-3732-4034-a430-366265373830/2025-03-26_125642.jpg' },
  { name: 'Акмарал Тулегенова', position: 'Член Наблюдательного Совета', category: 'leadership', photo: 'https://static.tildacdn.one/tild3135-3533-4765-a665-373135333665/photo_2025-04-29_152.jpeg' },
  { name: 'Максим Уваров', position: 'Председатель Наблюдательного Совета', category: 'leadership', photo: 'https://static.tildacdn.one/tild3663-3764-4365-a464-373162313661/noroot.png' },
  { name: 'Анастасия Дубовикова', position: 'Бухгалтер', category: 'leadership', photo: 'https://static.tildacdn.one/tild6464-6664-4963-a639-333864663632/photo_2025-04-29_152.jpeg' },
  // --- Экспертный Совет (council) ---
  { name: 'Асылбек Айтматов', position: 'Председатель Экспертного совета', category: 'council', photo: 'https://static.tildacdn.one/tild6565-6337-4663-b931-633362623630/photo_2024-12-04_151.jpeg' },
  { name: 'Арстанбек Абдикапаров', position: 'Член Экспертного совета', category: 'council', photo: 'https://static.tildacdn.one/tild3762-3664-4063-b735-616534383231/photo_2025-04-04_151.jpeg' },
  { name: 'Абдыбекова Рита', position: 'Член Экспертного совета', category: 'council', photo: 'https://static.tildacdn.one/tild6165-6364-4865-b265-396638343030/WhatsApp_Image_2025-.jpeg' },
  { name: 'Азимбек Сагынбаев', position: 'Член Экспертного совета', category: 'council', photo: 'https://static.tildacdn.one/tild6135-3865-4234-b137-316339363833/photo_2025-02-20_161.jpeg' },
  { name: 'Дмитрий Коваленко', position: 'Член Экспертного совета', category: 'council', photo: 'https://static.tildacdn.one/tild6638-3363-4461-b037-343439356564/image.png' },
  { name: 'Александр Хван', position: 'Член Экспертного совета', category: 'council', photo: 'https://static.tildacdn.one/tild3930-3365-4563-b331-393036376161/photo_2025-05-27_171.jpeg' },
  { name: 'Кулеш Василий Васильевич', position: 'Член Экспертного совета', category: 'council', photo: 'https://static.tildacdn.one/tild6236-6564-4030-b333-303334346663/photo_2025-11-28_171.jpeg' },
  { name: 'Батырбаев Бехруз Рассулжанович', position: 'Член Экспертного совета', category: 'council', photo: 'https://static.tildacdn.one/tild6330-3566-4533-b933-616365363162/photo_2025-11-28_172.jpeg' },
  { name: 'Эдилбек улуу Арсен', position: 'Член Экспертного совета', category: 'council', photo: 'https://static.tildacdn.one/tild3334-6262-4162-b237-336661613965/IMG_6035.JPG' },
  { name: 'Луйк Лембит Лембитович', position: 'Член Экспертного совета', category: 'council', photo: 'https://static.tildacdn.one/tild6662-6430-4530-b439-353537663835/photo_2025-11-28_174.jpeg' },
  { name: 'Сергеев Андрей', position: 'Член Экспертного совета', category: 'council', photo: 'https://static.tildacdn.one/tild6432-3636-4035-b761-353232383335/__2025-12-02__164130.png' },
];

const MAP = { а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'i',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya',' ':'-' };
function translit(s){ return s.toLowerCase().split('').map(c=>MAP[c]!==undefined?MAP[c]:c).join('').replace(/[^a-z0-9-]/g,'').replace(/-+/g,'-').replace(/^-|-$/g,''); }

async function uploadPhoto(url, slug) {
  const r = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000, headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://aurva.kg/' } });
  const ext = (url.split('.').pop() || 'jpg').split(/[?#]/)[0].toLowerCase();
  const ct = r.headers['content-type'] || (ext.includes('png') ? 'image/png' : 'image/jpeg');
  const path = `team/${slug}.${ext}`;
  const { error } = await sb.storage.from(BUCKET).upload(path, Buffer.from(r.data), { contentType: ct, upsert: true });
  if (error) throw new Error('upload ' + path + ': ' + error.message);
  return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

(async () => {
  console.log(`${TEAM.length} team members${COMMIT ? ' (COMMIT)' : ' (dry run)'}:`);
  TEAM.forEach((m, i) => console.log(`  ${String(i + 1).padStart(2)}. [${m.category}] ${m.name} — ${m.position}`));
  if (!COMMIT) { console.log('\nDRY RUN. Re-run with --commit to write.'); return; }

  const { data: existing } = await sb.from('team_members').select('id, photo_url');
  if (existing && existing.length) {
    for (const e of existing) { const m = e.photo_url && e.photo_url.match(/\/object\/public\/[^/]+\/(.+)$/); if (m) await sb.storage.from(BUCKET).remove([decodeURIComponent(m[1])]); }
    await sb.from('team_members').delete().in('id', existing.map(e => e.id));
    console.log(`deleted ${existing.length} existing team members`);
  }

  let order = 0;
  for (const m of TEAM) {
    const slug = translit(m.name);
    let photoUrl = null;
    try { photoUrl = await uploadPhoto(m.photo, slug); }
    catch (e) { console.log(`  ! photo fail ${m.name}: ${e.message}`); }
    const { error } = await sb.from('team_members').insert({
      name: m.name, position: m.position, category: m.category,
      photo_url: photoUrl, is_active: true, display_order: order++,
    });
    if (error) { console.log(`  ! insert fail ${m.name}: ${error.message}`); continue; }
    console.log(`  ✓ ${m.name} (photo ${photoUrl ? 'ok' : 'MISSING'})`);
  }
  console.log('\nDONE.');
})();
