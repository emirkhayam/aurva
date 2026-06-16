// Scrape all aurva.kg articles (title, content paragraphs, images) and merge with dates.
// Output: aurva-news-scrape.json  consumed by importNews.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const dates = JSON.parse(fs.readFileSync(path.join(__dirname, 'news_dates.json'), 'utf8'));
const SLUGS = Object.keys(dates);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const UAS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0',
];

async function fetchHtml(url, tries = 5) {
  for (let t = 0; t < tries; t++) {
    try {
      const r = await axios.get(url, { timeout: 25000, headers: {
        'User-Agent': UAS[t % UAS.length],
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
        'Referer': 'https://aurva.kg/news',
        'Upgrade-Insecure-Requests': '1',
      }});
      return r.data;
    } catch (e) {
      const s = e.response && e.response.status;
      if (t === tries - 1) throw new Error('status ' + s);
      await sleep(2500 + t * 2500 + Math.floor(Math.random() * 1500));
    }
  }
}

function meta(html, name) {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']*)["']`, 'i');
  const m = html.match(re); return m ? m[1] : null;
}
function decodeEntities(s) {
  return s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#34;/g, '"')
    .replace(/&#39;/g, "'").replace(/&laquo;/g, '«').replace(/&raquo;/g, '»').replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–').replace(/&hellip;/g, '…').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}
function extractParas(html) {
  // Tilda text blocks
  const blocks = [...html.matchAll(/<div[^>]+class="[^"]*t-redactor__text[^"]*"[^>]*>([\s\S]*?)<\/div>/gi)].map(m => m[1]);
  const paras = [];
  for (const b of blocks) {
    // split on block tags into lines, strip remaining tags
    const lines = b.replace(/<\s*br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|h[1-6]|li)>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .split('\n').map(s => decodeEntities(s).replace(/ /g, ' ').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    for (const l of lines) if (!paras.includes(l)) paras.push(l);
  }
  return paras;
}

(async () => {
  const out = [];
  for (let i = 0; i < SLUGS.length; i++) {
    const slug = SLUGS[i];
    const url = 'https://aurva.kg/tpost/' + slug;
    const rec = { i, slug, url, date: dates[slug] };
    try {
      const html = await fetchHtml(url);
      rec.status = 200;
      rec.title = decodeEntities(meta(html, 'og:title') || (html.match(/<title>([^<]+)<\/title>/i) || [])[1] || '').replace(/\s+/g, ' ').trim();
      rec.ogimage = meta(html, 'og:image');
      rec.paras = extractParas(html);
      const re = /https:\/\/static\.tildacdn\.com\/[A-Za-z0-9_\/\-]+\.(?:jpg|jpeg|png|webp)/gi;
      let imgs = [...new Set((html.match(re) || []))].filter(u => !/_SITE|logo|favicon/i.test(u));
      // ensure cover (og:image) first
      if (rec.ogimage && imgs.includes(rec.ogimage)) imgs = [rec.ogimage, ...imgs.filter(u => u !== rec.ogimage)];
      else if (rec.ogimage && /tildacdn/.test(rec.ogimage)) imgs = [rec.ogimage, ...imgs];
      rec.images = imgs;
      const bodyLen = rec.paras.join(' ').length;
      console.log(`${String(i).padStart(2)} ok body:${String(bodyLen).padStart(4)} img:${String(imgs.length).padStart(2)} ${rec.date} | ${rec.title.slice(0,40)}`);
    } catch (e) {
      rec.status = 0; rec.error = e.message;
      console.log(`${i} ERR ${e.message} | ${slug}`);
    }
    out.push(rec);
    await sleep(1200 + Math.floor(Math.random() * 800));
  }
  fs.writeFileSync(path.join(__dirname, 'aurva-news-scrape.json'), JSON.stringify(out, null, 2));
  const ok = out.filter(r => r.status === 200).length;
  const ti = out.reduce((s, r) => s + (r.images || []).length, 0);
  console.log(`\nSCRAPE DONE: ${ok}/${out.length} ok, ${ti} images total -> aurva-news-scrape.json`);
})();
