// Full re-import of aurva.kg news into our Supabase (text + cover + gallery).
// Strategy chosen by owner: download every image into our `uploads` bucket; wipe existing 36 and import all fresh.
// Input: aurva-news-scrape.json  (array of {slug,title,date,articleBody,paras[],images[],ogimage})
// Run:   node importNews.js          (dry-run summary, no writes)
//        node importNews.js --commit (delete existing + import all)
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const BUCKET = process.env.STORAGE_BUCKET || 'uploads';
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY);
const COMMIT = process.argv.includes('--commit');
const sleep = ms => new Promise(r => setTimeout(r, ms));

function tildaSlug(slug) {            // "tm0hh80ro1-aurva-na-kit-forume-2026" -> "aurva-na-kit-forume-2026"
  const m = slug.match(/^[a-z0-9]+-(.+)$/i);
  return (m ? m[1] : slug).toLowerCase();
}
function categorize(title) {
  const t = (title || '').toLowerCase();
  if (/панельн|аналитич/.test(t)) return 'analytics';
  if (/меморандум|подписан|госфиннадз|гсфр|\bпвт\b|\bгнс\b|председател|наблюдательн|экспертн|союз банк|устойчивост|регулир|сертификат|международн|делов/.test(t)) return 'regulation';
  if (/встреч|обучени|собрани|форум|конгресс|вечер|завтрак|олимпиад|рожден|biff|crypto|\bkit\b|кит |digital|decentral|world|поток|конференц|сесси|биржа/.test(t)) return 'events';
  return 'other';
}
function buildBody(rec) {
  let body = '';
  if (rec.articleBody && rec.articleBody.trim().length > 40) body = rec.articleBody.trim();
  else if (rec.paras && rec.paras.length) body = rec.paras.join('\n\n');
  // drop a leading duplicate of the title
  const titleNorm = (rec.title || '').replace(/\s+/g, ' ').trim();
  body = body.split('\n').filter(l => l.replace(/\s+/g, ' ').trim() !== titleNorm).join('\n').trim();
  return body;
}
function parseDate(s) {                 // "10.06.2026" -> ISO at noon UTC
  if (!s) return null;
  const m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m) return new Date(Date.UTC(+m[3], +m[2] - 1, +m[1], 12, 0, 0)).toISOString();
  const d = new Date(s);
  return isNaN(d) ? null : d.toISOString();
}
function makeExcerpt(body) {
  const plain = body.replace(/[#*_>`]/g, '').replace(/\s+/g, ' ').trim();
  if (plain.length <= 200) return plain;
  return plain.slice(0, 197).replace(/\s+\S*$/, '') + '…';
}

async function downloadAndUpload(imgUrl, destPath) {
  const r = await axios.get(imgUrl, { responseType: 'arraybuffer', timeout: 30000, headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://aurva.kg/' } });
  const buf = Buffer.from(r.data);
  const ct = r.headers['content-type'] || 'image/jpeg';
  const { error } = await sb.storage.from(BUCKET).upload(destPath, buf, { contentType: ct, upsert: true });
  if (error) throw new Error('upload ' + destPath + ': ' + error.message);
  const { data } = sb.storage.from(BUCKET).getPublicUrl(destPath);
  return data.publicUrl;
}

async function wipeExisting() {
  const { data: rows } = await sb.from('news').select('id, image_url, news_images(image_url)');
  if (!rows || !rows.length) { console.log('  nothing to wipe'); return; }
  // collect storage paths that live in our bucket
  const paths = [];
  for (const r of rows) {
    const all = [r.image_url, ...((r.news_images || []).map(i => i.image_url))];
    for (const u of all) {
      const m = u && u.match(/\/object\/public\/[^/]+\/(.+)$/);
      if (m) paths.push(decodeURIComponent(m[1]));
    }
  }
  if (paths.length) {
    for (let i = 0; i < paths.length; i += 100) {
      const { error } = await sb.storage.from(BUCKET).remove(paths.slice(i, i + 100));
      if (error) console.log('  storage remove warn:', error.message);
    }
    console.log(`  removed ${paths.length} old storage files`);
  }
  await sb.from('news_images').delete().in('news_id', rows.map(r => r.id));
  const { error: de } = await sb.from('news').delete().in('id', rows.map(r => r.id));
  if (de) throw new Error('delete news: ' + de.message);
  console.log(`  deleted ${rows.length} existing news rows`);
}

(async () => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'aurva-news-scrape.json'), 'utf8'));
  // newest-first in file -> publish oldest first so created order is chronological
  const articles = data.filter(r => r.status === 200 && !r.error);
  const valid = articles.filter(r => buildBody(r).length > 30 && (r.images || []).length > 0);
  console.log(`scrape: ${data.length} records, ${articles.length} ok(200), ${valid.length} with body+image`);
  valid.forEach(r => console.log(`  [${categorize(r.title)}] img:${(r.images||[]).length} body:${buildBody(r).length} | ${tildaSlug(r.slug)}`));

  if (!COMMIT) { console.log('\nDRY RUN. Re-run with --commit to write.'); return; }
  if (valid.length < 40) { console.log(`\nABORT: only ${valid.length} valid articles (<40). Re-scrape before committing.`); process.exit(1); }

  console.log('\nWiping existing news...');
  await wipeExisting();

  const ordered = [...valid].reverse(); // oldest first
  let ok = 0, imgCount = 0;
  for (const rec of ordered) {
    const slug = tildaSlug(rec.slug);
    const body = buildBody(rec);
    const title = (rec.title || '').replace(/\s+/g, ' ').trim();
    const content = `# ${title}\n\n${body}`;
    const category = categorize(title);
    const excerpt = makeExcerpt(body);
    const publishedAt = parseDate(rec.date);

    // upload images
    const publicUrls = [];
    const imgs = [...new Set(rec.images)];
    for (let k = 0; k < imgs.length; k++) {
      const ext = (imgs[k].split('.').pop() || 'jpg').split(/[?#]/)[0];
      try {
        const url = await downloadAndUpload(imgs[k], `news/${slug}/${k}.${ext}`);
        publicUrls.push(url);
        imgCount++;
      } catch (e) { console.log(`   ! img fail ${slug} #${k}: ${e.message}`); }
      await sleep(120);
    }
    if (!publicUrls.length) { console.log(`   ! SKIP ${slug} (no images uploaded)`); continue; }

    const { data: news, error } = await sb.from('news').insert({
      title, slug, excerpt, content, category,
      image_url: publicUrls[0], published: true, published_at: publishedAt, views: 0
    }).select().single();
    if (error) { console.log(`   ! insert fail ${slug}: ${error.message}`); continue; }

    const rows = publicUrls.map((u, idx) => ({ news_id: news.id, image_url: u, display_order: idx }));
    const { error: ie } = await sb.from('news_images').insert(rows);
    if (ie) console.log(`   ! images insert fail ${slug}: ${ie.message}`);
    ok++;
    console.log(`   ✓ ${slug} (${publicUrls.length} imgs) [${category}]`);
  }
  console.log(`\nDONE: ${ok}/${ordered.length} articles, ${imgCount} images uploaded.`);
})();
