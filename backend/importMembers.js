// Import association members from aurva.kg homepage carousel.
// 5 already exist (BitHub, Envoys, Royal, KLN, WeChange) -> only set display_order.
// 6 new (prime finance, Relopay, Azimut Capital, Standard Development, TradeWave, OSON X) -> download logo + insert.
// Run: node importMembers.js          (dry run)
//      node importMembers.js --commit (write)
require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const BUCKET = process.env.STORAGE_BUCKET || 'uploads';
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY);
const COMMIT = process.argv.includes('--commit');

// Ordered as on the live carousel
// All logos re-downloaded from the aurva.kg carousel into our Storage (existing 5 were hotlinked
// to external company sites; Envoys' link was already 404 — this fixes them and unifies hosting).
const ORDER = [
  { match: 'bithub',   name: 'BitHub',   slug: 'bithub',   logo: 'https://static.tildacdn.one/tild6165-3935-4238-b766-393266333636/A5_-_3.jpg' },
  { match: 'envoys',   name: 'Envoys',   slug: 'envoys',   logo: 'https://static.tildacdn.one/tild6134-3135-4035-b864-646261356130/photo_2024-12-04_141.jpeg' },
  { match: 'royal',    name: 'Royal',    slug: 'royal',    logo: 'https://static.tildacdn.one/tild3134-6436-4130-a239-393831666532/photo_2025-09-11_183.jpeg' },
  { match: 'kln',      name: 'KLN',      slug: 'kln',      logo: 'https://static.tildacdn.one/tild3564-3437-4363-b366-386533666434/_.png' },
  { match: 'wechange', name: 'WeChange', slug: 'wechange', logo: 'https://static.tildacdn.one/tild3565-6661-4436-b262-363130616237/Logo_2.png' },
  { name: 'prime finance',        slug: 'prime-finance',        logo: 'https://static.tildacdn.one/tild6462-6364-4861-b166-353964656433/__2025-06-16__145801.png' },
  { name: 'Relopay',              slug: 'relopay',              logo: 'https://static.tildacdn.one/tild3235-3661-4239-a133-386161636332/Asset-1.jpg' },
  { name: 'Azimut Capital',       slug: 'azimut-capital',       logo: 'https://static.tildacdn.one/tild3835-6464-4661-b939-393634633434/WhatsApp_Image_2025-.jpeg' },
  { name: 'Standard Development', slug: 'standard-development',  logo: 'https://static.tildacdn.one/tild3635-3264-4365-b031-353737356330/_.jpg' },
  { name: 'TradeWave',            slug: 'tradewave',            logo: 'https://static.tildacdn.one/tild3165-3239-4163-b533-386531356163/Instagram_post_-_2.jpg' },
  { name: 'OSON X',               slug: 'oson-x',               logo: 'https://static.tildacdn.one/tild3238-3932-4736-b237-623631323663/OSONX_W1.png' },
];

async function uploadLogo(url, slug) {
  const r = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000, headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://aurva.kg/' } });
  const ext = (url.split('.').pop() || 'png').split(/[?#]/)[0].toLowerCase();
  const ct = r.headers['content-type'] || (ext.includes('png') ? 'image/png' : 'image/jpeg');
  const path = `members/${slug}.${ext}`;
  const { error } = await sb.storage.from(BUCKET).upload(path, Buffer.from(r.data), { contentType: ct, upsert: true });
  if (error) throw new Error('upload ' + path + ': ' + error.message);
  return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

(async () => {
  const { data: existing } = await sb.from('members').select('id, name, slug, logo_url');
  const findExisting = m => (existing || []).find(e =>
    (m.match && ((e.name || '').toLowerCase().includes(m.match) || (e.slug || '').toLowerCase().includes(m.match)))
    || (m.slug && (e.slug || '').toLowerCase() === m.slug.toLowerCase()));

  console.log(`Plan${COMMIT ? ' (COMMIT)' : ' (dry run)'}:`);
  ORDER.forEach((m, i) => {
    const ex = findExisting(m);
    console.log(`  ${String(i + 1).padStart(2)}. ${m.name} -> ${ex ? `update order (exists #${ex.id})` : 'NEW (download logo + insert)'}`);
  });
  if (!COMMIT) { console.log('\nDRY RUN. Re-run with --commit to write.'); return; }

  let order = 1;
  for (const m of ORDER) {
    const ex = findExisting(m);
    if (ex) {
      let logoUrl = ex.logo_url;
      if (m.logo) { try { logoUrl = await uploadLogo(m.logo, m.slug); } catch (e) { console.log(`  ! logo fail ${m.name}: ${e.message}`); } }
      const { error } = await sb.from('members').update({ display_order: order, is_active: true, logo_url: logoUrl }).eq('id', ex.id);
      console.log(error ? `  ! update ${m.name}: ${error.message}` : `  ✓ ${m.name} (order ${order}, existing, logo re-hosted)`);
    } else {
      let logoUrl = null;
      try { logoUrl = await uploadLogo(m.logo, m.slug); } catch (e) { console.log(`  ! logo fail ${m.name}: ${e.message}`); }
      const { error } = await sb.from('members').insert({
        name: m.name, slug: m.slug, logo_url: logoUrl, website: null,
        is_active: true, display_order: order,
      });
      console.log(error ? `  ! insert ${m.name}: ${error.message}` : `  ✓ ${m.name} (order ${order}, NEW, logo ${logoUrl ? 'ok' : 'MISSING'})`);
    }
    order++;
  }
  console.log('\nDONE.');
})();
