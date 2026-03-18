import dotenv from 'dotenv';
import sequelize from '../config/database';
import { News } from '../models';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Realistic news articles for AURVA
const newsArticles = [
  {
    title: 'AURVA провела встречу с представителями Нацбанка КР по вопросам регулирования криптовалют',
    slug: 'aurva-meeting-national-bank',
    excerpt: 'Состоялась важная встреча между руководством AURVA и представителями Национального банка Кыргызской Республики для обсуждения перспектив регулирования рынка виртуальных активов.',
    content: `<p>15 февраля 2024 года в офисе Национального банка Кыргызской Республики состоялась встреча между представителями Ассоциации участников рынка виртуальных активов (AURVA) и руководством регулятора.</p>

<p>На встрече обсуждались ключевые вопросы регулирования криптовалютного рынка в Кыргызстане, включая:</p>

<ul>
<li>Механизмы лицензирования операторов криптовалютных бирж</li>
<li>Требования к противодействию отмыванию денег (AML) и финансированию терроризма (CFT)</li>
<li>Налогообложение операций с виртуальными активами</li>
<li>Защита прав инвесторов и потребителей</li>
</ul>

<p>Представители AURVA представили позицию участников рынка и предложения по формированию благоприятной регуляторной среды, которая бы стимулировала развитие индустрии при обеспечении необходимых мер безопасности.</p>

<p>Следующая встреча запланирована на март 2024 года, где будут детально рассмотрены конкретные нормативные акты.</p>`,
    category: 'regulation',
    imageUrl: 'https://images.unsplash.com/photo-1560221328-12fe60f83ab8?w=800&h=600&fit=crop',
    published: true
  },
  {
    title: 'Международная конференция Blockchain Central Asia 2024 пройдет в Бишкеке',
    slug: 'blockchain-central-asia-2024',
    excerpt: 'AURVA выступает организатором крупнейшего блокчейн-форума в регионе, который состоится 15-16 мая 2024 года в столице Кыргызстана.',
    content: `<p>Ассоциация AURVA рада объявить о проведении международной конференции Blockchain Central Asia 2024, которая пройдет 15-16 мая в отеле Hyatt Regency в Бишкеке.</p>

<p>Мероприятие соберет более 500 участников из 15 стран региона, включая:</p>

<ul>
<li>Представителей криптобирж и финтех-компаний</li>
<li>Блокчейн-разработчиков и технических экспертов</li>
<li>Венчурных инвесторов и фондов</li>
<li>Представителей регуляторов и государственных органов</li>
<li>Юристов, специализирующихся на цифровых активах</li>
</ul>

<p><strong>Программа конференции включает:</strong></p>

<p>День 1: Регулирование и комплаенс, DeFi и Web3, Институциональные инвестиции</p>
<p>День 2: Технологии блокчейн, NFT и метавселенные, Практические кейсы внедрения</p>

<p>Среди подтвержденных спикеров - руководители ведущих криптобирж региона, представители международных блокчейн-проектов и эксперты в области регулирования.</p>

<p><strong>Регистрация открыта на официальном сайте конференции.</strong> Ранняя регистрация действует до 1 апреля 2024 года.</p>`,
    category: 'events',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
    published: true
  },
  {
    title: 'Рынок криптовалют в Кыргызстане: итоги 2023 года и перспективы развития',
    slug: 'crypto-market-kyrgyzstan-2023-review',
    excerpt: 'AURVA представляет аналитический отчет о состоянии криптовалютного рынка Кыргызстана по итогам 2023 года с прогнозами на 2024 год.',
    content: `<p>Ассоциация AURVA подготовила комплексный аналитический отчет о развитии рынка виртуальных активов в Кыргызстане за 2023 год.</p>

<h3>Ключевые показатели 2023 года:</h3>

<ul>
<li><strong>Объем торгов:</strong> Совокупный объем торгов на локальных криптобиржах вырос на 145% по сравнению с 2022 годом</li>
<li><strong>Количество пользователей:</strong> Число активных участников рынка увеличилось до 85,000 человек</li>
<li><strong>Майнинг:</strong> Кыргызстан вошел в топ-20 стран по объемам майнинга Bitcoin</li>
<li><strong>Бизнес:</strong> Зарегистрировано 23 новых компании, работающих с криптовалютами</li>
</ul>

<h3>Основные тренды:</h3>

<p><strong>1. Институционализация рынка</strong> - крупные компании начали принимать криптовалюту как средство платежа</p>

<p><strong>2. Развитие DeFi</strong> - рост интереса к децентрализованным финансовым сервисам на 230%</p>

<p><strong>3. Образование</strong> - запущено 5 образовательных программ по блокчейну и криптовалютам</p>

<h3>Прогнозы на 2024 год:</h3>

<ul>
<li>Ожидается принятие базового закона о виртуальных активах</li>
<li>Рост рынка на 80-120%</li>
<li>Появление первых лицензированных операторов</li>
<li>Развитие криптовалютного туризма в регионе</li>
</ul>

<p>Полная версия отчета доступна для членов AURVA.</p>`,
    category: 'analytics',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop',
    published: true
  },
  {
    title: 'AURVA запускает образовательную программу "Блокчейн для бизнеса"',
    slug: 'aurva-blockchain-education-program',
    excerpt: 'Новая образовательная инициатива AURVA поможет предпринимателям и менеджерам освоить технологии блокчейн и внедрить их в бизнес-процессы.',
    content: `<p>Ассоциация AURVA объявляет о запуске образовательной программы "Блокчейн для бизнеса", направленной на повышение уровня знаний предпринимателей и руководителей компаний о возможностях технологии распределенных реестров.</p>

<h3>Программа курса включает:</h3>

<p><strong>Модуль 1: Основы блокчейн-технологий</strong></p>
<ul>
<li>Принципы работы блокчейна</li>
<li>Виды блокчейн-сетей</li>
<li>Смарт-контракты и их применение</li>
</ul>

<p><strong>Модуль 2: Криптовалюты и цифровые активы</strong></p>
<ul>
<li>Bitcoin, Ethereum и альткоины</li>
<li>DeFi и децентрализованные биржи</li>
<li>NFT и токенизация активов</li>
</ul>

<p><strong>Модуль 3: Практическое применение в бизнесе</strong></p>
<ul>
<li>Кейсы внедрения блокчейна в различных отраслях</li>
<li>Оценка целесообразности внедрения</li>
<li>Регуляторные аспекты</li>
</ul>

<p><strong>Модуль 4: Безопасность и риск-менеджмент</strong></p>
<ul>
<li>Киберугрозы и методы защиты</li>
<li>AML/CFT требования</li>
<li>Страхование криптоактивов</li>
</ul>

<h3>Формат обучения:</h3>

<p>Курс проводится в гибридном формате (офлайн + онлайн) продолжительностью 6 недель. Занятия ведут практикующие эксперты индустрии.</p>

<p><strong>Старт первого потока:</strong> 1 апреля 2024 года<br>
<strong>Количество мест:</strong> 30<br>
<strong>Стоимость:</strong> Для членов AURVA - 15,000 сом, для остальных - 25,000 сом</p>

<p>Регистрация открыта до 20 марта на сайте AURVA.</p>`,
    category: 'events',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop',
    published: true
  },
  {
    title: 'Новые правила KYC для криптовалютных бирж вступают в силу с 1 марта',
    slug: 'new-kyc-rules-crypto-exchanges',
    excerpt: 'Государственная финансовая разведка КР утвердила обновленные требования по идентификации клиентов для операторов криптовалютных платформ.',
    content: `<p>С 1 марта 2024 года вступают в силу новые требования Государственной финансовой разведки Кыргызской Республики по идентификации клиентов (KYC - Know Your Customer) для компаний, предоставляющих услуги по обмену и хранению виртуальных активов.</p>

<h3>Основные требования:</h3>

<p><strong>1. Идентификация физических лиц:</strong></p>
<ul>
<li>Полные паспортные данные</li>
<li>ИНН/личный налоговый номер</li>
<li>Адрес фактического проживания</li>
<li>Верификация через биометрию или видеозвонок</li>
</ul>

<p><strong>2. Идентификация юридических лиц:</strong></p>
<ul>
<li>Регистрационные документы</li>
<li>Данные о бенефициарных владельцах</li>
<li>Информация о руководителях</li>
<li>Подтверждение юридического адреса</li>
</ul>

<p><strong>3. Мониторинг транзакций:</strong></p>
<ul>
<li>Обязательная фиксация всех операций</li>
<li>Дополнительная проверка транзакций свыше 200,000 сом</li>
<li>Отчетность о подозрительных операциях</li>
</ul>

<h3>Переходный период:</h3>

<p>Для действующих клиентов установлен переходный период до 1 июня 2024 года для прохождения обновленной процедуры KYC. Клиенты, не завершившие верификацию до указанной даты, получат ограничения на операции.</p>

<p><strong>AURVA подготовила для своих членов методические рекомендации по внедрению новых требований и проведет серию вебинаров по практическим аспектам их применения.</strong></p>

<p>Первый вебинар состоится 25 февраля в 15:00. Регистрация на сайте ассоциации.</p>`,
    category: 'regulation',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop',
    published: true
  },
  {
    title: 'В Кыргызстане появилась первая криптовалютная карта с кэшбэком',
    slug: 'first-crypto-cashback-card-kyrgyzstan',
    excerpt: 'Местный финтех-стартап при поддержке AURVA запустил дебетовую карту, которая начисляет кэшбэк в Bitcoin за каждую покупку.',
    content: `<p>Кыргызский финтех-стартап CryptoCard.kg, являющийся членом AURVA, представил первую в стране дебетовую карту с кэшбэком в криптовалюте.</p>

<h3>Особенности карты:</h3>

<ul>
<li><strong>Кэшбэк в Bitcoin:</strong> 1.5% от каждой покупки возвращается в BTC</li>
<li><strong>Интеграция с биржами:</strong> Автоматическая конвертация сомов в криптовалюту</li>
<li><strong>Без комиссий:</strong> Бесплатное обслуживание при обороте от 10,000 сом/месяц</li>
<li><strong>Бесконтактная оплата:</strong> Поддержка NFC и мобильных кошельков</li>
</ul>

<h3>Как это работает:</h3>

<p>Пользователь пополняет карту в сомах через банковский перевод или наличными в партнерских точках. При совершении покупок 1.5% от суммы автоматически конвертируется в Bitcoin и зачисляется на криптокошелек пользователя.</p>

<p>Накопленные BTC можно:</p>
<ul>
<li>Хранить для долгосрочных инвестиций</li>
<li>Вывести на внешний кошелек</li>
<li>Обменять на другие криптовалюты</li>
<li>Конвертировать обратно в сомы</li>
</ul>

<h3>Партнерская программа:</h3>

<p>Более 200 торговых точек в Бишкеке уже подключились к программе и предлагают повышенный кэшбэк до 5% для держателей CryptoCard:</p>

<ul>
<li>Рестораны и кафе - 3%</li>
<li>Заправочные станции - 2%</li>
<li>Онлайн-магазины - 4%</li>
<li>Туристические услуги - 5%</li>
</ul>

<p><strong>Оформить карту можно онлайн на сайте CryptoCard.kg. Стоимость выпуска - 500 сом, первые 1000 клиентов получают карту бесплатно.</strong></p>

<p>AURVA выступила консультантом проекта по вопросам соответствия регуляторным требованиям.</p>`,
    category: 'other',
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
    published: true
  }
];

async function downloadImage(url: string, filename: string): Promise<string> {
  try {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'news');

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, response.data);

    return `/uploads/news/${filename}`;
  } catch (error) {
    console.error(`Failed to download image ${url}:`, error);
    return url; // Return original URL if download fails
  }
}

const seedRealNews = async () => {
  try {
    console.log('🌱 Starting real news seeding...');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync models
    await sequelize.sync();
    console.log('✅ Models synchronized');

    // Clear existing news
    await News.destroy({ where: {} });
    console.log('🗑️  Cleared existing news');

    console.log('📰 Downloading images and creating news articles...');

    let successCount = 0;
    let failCount = 0;

    for (const [index, article] of newsArticles.entries()) {
      try {
        const timestamp = Date.now() - (index * 86400000 * 2); // Each article 2 days older
        const imageFilename = `article-${index + 1}-${Date.now()}.jpg`;

        console.log(`\n[${index + 1}/${newsArticles.length}] Processing: ${article.title.substring(0, 50)}...`);

        // Download image
        let imageUrl = article.imageUrl;
        if (article.imageUrl.includes('unsplash.com')) {
          console.log(`   ⬇️  Downloading image...`);
          imageUrl = await downloadImage(article.imageUrl, imageFilename);
          console.log(`   ✅ Image saved: ${imageUrl}`);
        }

        // Create news article
        const news = await News.create({
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          category: article.category as 'regulation' | 'events' | 'analytics' | 'other',
          imageUrl: imageUrl,
          published: article.published,
          publishedAt: new Date(timestamp),
          views: Math.floor(Math.random() * 500) + 100 // Random views between 100-600
        });

        console.log(`   ✅ Article created (ID: ${news.id})`);
        successCount++;
      } catch (error) {
        console.error(`   ❌ Failed to create article:`, error);
        failCount++;
      }
    }

    console.log('');
    console.log('✅ Real news seeding completed!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   ✅ Success: ${successCount} articles`);
    console.log(`   ❌ Failed: ${failCount} articles`);
    console.log(`   📰 Total news in database: ${await News.count()}`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding real news:', error);
    process.exit(1);
  }
};

seedRealNews();
