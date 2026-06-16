// Compact viewer for capture dumps — feeds the LLM judge (or your eyes).
// Usage: node runner/show.mjs --category A_anonymous   |   node runner/show.mjs J001 J009
import fs from 'node:fs';
import path from 'node:path';

const CAP = process.env.JOURNEY_CAPTURES || path.join(process.cwd(), 'journey-results', 'captures');
if (!fs.existsSync(CAP)) { console.error(`No captures at ${CAP}. Run capture.mjs first.`); process.exit(1); }

const args = process.argv.slice(2);
let files = fs.readdirSync(CAP).filter((f) => f.endsWith('.json')).sort();
const ci = args.indexOf('--category');
if (ci !== -1) { const cat = args[ci + 1]; files = files.filter((f) => JSON.parse(fs.readFileSync(path.join(CAP, f))).category === cat); }
else if (args.length) { const ids = new Set(args.map((s) => s.toUpperCase() + '.json')); files = files.filter((f) => ids.has(f)); }

for (const f of files) {
  const j = JSON.parse(fs.readFileSync(path.join(CAP, f), 'utf8'));
  if (j.fatal) { console.log(`### ${j.id} [${j.category}] FATAL: ${j.fatal}\n---`); continue; }
  const c = j.capture || {};
  const lg = typeof j.login === 'object' ? `login_ok=${j.login.ok}${j.login.errText ? ' err="' + j.login.errText.slice(0, 80) + '"' : ''}` : j.login;
  console.log(`### ${j.id} [${j.category}] negative=${j.negative} ${lg}`);
  console.log(`title_attr: ${c.title || ''}`);
  console.log(`landed_url: ${c.url || ''}  | note: ${j.actionNote || ''}`);
  if (j.requires?.length) console.log(`requires: ${j.requires.join(',')}`);
  console.log(`intent: ${j.intent}`);
  console.log(`expected:`);
  (j.expected_observations || []).forEach((o, i) => console.log(`  ${i + 1}. ${o}`));
  if (j.consoleErrors?.length) console.log(`console_errors: ${JSON.stringify(j.consoleErrors)}`);
  if (j.netErrors?.length) console.log(`net_errors: ${JSON.stringify(j.netErrors)}`);
  console.log(`headings: ${JSON.stringify(c.headings || [])}`);
  console.log(`buttons: ${JSON.stringify(c.buttons || [])}`);
  console.log(`links: ${JSON.stringify((c.links || []).map((l) => l.t))}`);
  console.log(`inputs: ${JSON.stringify((c.inputs || []).map((i) => i.type + (i.ph ? ':' + i.ph : '') + (i.aria ? '#' + i.aria : '')))}`);
  if (c.imgs?.length) console.log(`imgs: ${JSON.stringify(c.imgs.map((i) => i.alt + ':' + i.src))}`);
  if (typeof c.hasHorizontalOverflow === 'boolean') console.log(`horizontal_overflow: ${c.hasHorizontalOverflow}  viewport: ${JSON.stringify(j.viewport)}`);
  console.log(`body: ${(c.bodyText || '').replace(/\n+/g, ' / ').slice(0, 1000)}`);
  console.log('---');
}
