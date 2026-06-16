// Import partners from aurva.kg/about into our Supabase (logos -> our Storage, full info).
// Run: node importPartners.js          (dry run)
//      node importPartners.js --commit (write)
require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const BUCKET = process.env.STORAGE_BUCKET || 'uploads';
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY);
const COMMIT = process.argv.includes('--commit');

const PARTNERS = [
  {
    slug: 'rost-fm',
    name: 'ОсОО Рост ФМ',
    website: null,
    modalTitle: 'ОсОО Рост ФМ',
    modalDescription:
      'Партнерство с ведущей консалтинговой компанией в области бухгалтерии и финансового консультирования. Рост ФМ предоставляет профессиональные услуги по оптимизации финансов, налоговым консультациям и сопровождению бизнеса.\n' +
      'Вместе с ними мы будем проводить обучающие мероприятия, тренинги и семинары, которые помогут нашим резидентам лучше разобраться в вопросах бухгалтерии, налогового учета и финансового планирования.',
    benefits: '',
    logo: 'https://static.tildacdn.one/tild3462-3866-4438-b431-396130623265/Instagram_post_-_2.png',
    displayOrder: 1,
  },
  {
    slug: 'match-systems',
    name: 'Match Systems',
    website: 'https://matchsystems.com/',
    modalTitle: 'Match Systems',
    modalDescription:
      'Компания MatchSystems является одним из ключевых партнеров нашей Ассоциации. Специализируясь на выявлении и предотвращении криптовалютных преступлений, MatchSystems вносит значительный вклад в развитие безопасного и прозрачного криптовалютного рынка.\n' +
      'Партнерство с MatchSystems помогает резидентам Ассоциации укрепить свои компетенции, соответствовать международным стандартам и создавать безопасные условия для работы с виртуальными активами.',
    benefits:
      'Разработка и внедрение эффективных решений для борьбы с криптовалютными преступлениями.\n' +
      'Проведение совместного курса по криптокомплаенсу и AML (противодействие отмыванию денег) для резидентов Ассоциации.\n' +
      'Обмен знаниями, методиками и инструментами для повышения уровня безопасности в отрасли.',
    logo: 'https://static.tildacdn.one/tild6630-6365-4239-b766-623264646361/Logo_MatchSystems.jpg',
    displayOrder: 2,
  },
  {
    slug: 'cii-suisse',
    name: 'Швейцарская Некоммерческая Ассоциация «Centre International d’investissement»',
    website: 'https://cii-suisse.org/',
    modalTitle: 'Centre International d’investissement',
    modalDescription:
      'Наша ассоциация гордится партнерством с Швейцарской Некоммерческой Ассоциацией «Centre International d’Investissement». Совместная работа направлена на развитие инновационных решений, проведение научных исследований, а также внедрение перспективных разработок.',
    benefits:
      'Реализация совместных проектов и разработок, ориентированных на развитие технологий и инноваций.\n' +
      'Организация зарубежных поездок, включая конференции, семинары, стажировки и деловые визиты для представителей обеих сторон.\n' +
      'Обмен методическими материалами для повышения профессионального уровня участников.\n' +
      'Разработка и реализация актуальных программ переподготовки и повышения квалификации, включая тренинги и семинары.\n' +
      'Обмен информацией, представляющей взаимный интерес, для повышения профессиональных компетенций и расширения возможностей обеих организаций.',
    logo: 'https://static.tildacdn.one/tild6336-3131-4438-b936-373563356639/Instagram_post_-_4.png',
    displayOrder: 3,
  },
  {
    slug: 'mydatacoin',
    name: 'MyDataCoin',
    website: 'https://mydatacoin.io/',
    modalTitle: 'MyDataCoin',
    modalDescription:
      'Мы рады объявить о стратегическом партнерстве с MyDataCoin, инновационной платформой, которая преобразует данные в цифровые активы. My Data Coin помогает пользователям безопасно монетизировать свои данные, создавая новые возможности для их использования и обмена.\n' +
      'В рамках этого партнерства мы организуем совместные мероприятия, обучающие программы и тренинги, чтобы помочь нашим пользователям и партнерам освоить технологии защиты данных и монетизации.',
    benefits: '',
    logo: 'https://static.tildacdn.one/tild3165-3632-4233-a133-316335376230/Instagram_post_-_3.png',
    displayOrder: 4,
  },
];

async function uploadLogo(url, slug) {
  const r = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000, headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://aurva.kg/' } });
  const ext = (url.split('.').pop() || 'png').split(/[?#]/)[0].toLowerCase();
  const ct = r.headers['content-type'] || (ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png');
  const path = `partners/${slug}.${ext}`;
  const { error } = await sb.storage.from(BUCKET).upload(path, Buffer.from(r.data), { contentType: ct, upsert: true });
  if (error) throw new Error('upload ' + path + ': ' + error.message);
  return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

(async () => {
  console.log(`${PARTNERS.length} partners to import${COMMIT ? ' (COMMIT)' : ' (dry run)'}:`);
  PARTNERS.forEach(p => console.log(`  ${p.displayOrder}. ${p.name} | site:${p.website || '—'} | benefits:${p.benefits ? p.benefits.split('\n').length : 0}`));
  if (!COMMIT) { console.log('\nDRY RUN. Re-run with --commit to write.'); return; }

  // wipe existing (table currently empty, but keep idempotent)
  const { data: existing } = await sb.from('partners').select('id, logo_url');
  if (existing && existing.length) {
    for (const e of existing) { const m = e.logo_url && e.logo_url.match(/\/object\/public\/[^/]+\/(.+)$/); if (m) await sb.storage.from(BUCKET).remove([decodeURIComponent(m[1])]); }
    await sb.from('partners').delete().in('id', existing.map(e => e.id));
    console.log(`deleted ${existing.length} existing partners`);
  }

  for (const p of PARTNERS) {
    let logoUrl = null;
    try { logoUrl = await uploadLogo(p.logo, p.slug); }
    catch (e) { console.log(`  ! logo fail ${p.slug}: ${e.message}`); }
    const { error } = await sb.from('partners').insert({
      name: p.name, slug: p.slug, website: p.website, logo_url: logoUrl,
      modal_title: p.modalTitle, modal_description: p.modalDescription, benefits: p.benefits,
      is_active: true, display_order: p.displayOrder,
    });
    if (error) { console.log(`  ! insert fail ${p.slug}: ${error.message}`); continue; }
    console.log(`  ✓ ${p.name} (logo ${logoUrl ? 'ok' : 'MISSING'})`);
  }
  console.log('\nDONE.');
})();
