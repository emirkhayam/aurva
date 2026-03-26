import dotenv from 'dotenv';
import sequelize from '../config/database';
import { News, Member, Contact } from '../models';

dotenv.config();

const seedData = async () => {
  try {
    console.log('🌱 Starting sample data seeding...');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync models
    await sequelize.sync();
    console.log('✅ Models synchronized');

    // Seed News
    console.log('📰 Seeding news articles...');
    const newsCount = await News.count();
    if (newsCount === 0) {
      await News.bulkCreate([
        {
          title: 'AURVA запускает новую платформу для криптобизнеса',
          slug: 'aurva-novaya-platforma',
          excerpt: 'Ассоциация пользователей и разработчиков виртуальных активов представляет новую платформу для развития криптоиндустрии в Кыргызстане.',
          content: '<p>Ассоциация AURVA рада объявить о запуске новой платформы, которая станет центральным хабом для криптобизнеса в Кыргызстане.</p><p>Платформа предоставит участникам доступ к актуальной информации о регулировании, событиях и аналитике рынка.</p>',
          category: 'events',
          published: true,
          publishedAt: new Date(),
          views: 0
        },
        {
          title: 'Новые правила регулирования криптовалют в КР',
          slug: 'novye-pravila-regulirovaniya',
          excerpt: 'Правительство Кыргызстана утвердило новые правила для работы с виртуальными активами.',
          content: '<p>В рамках развития цифровой экономики Кыргызстана были утверждены новые правила регулирования операций с виртуальными активами.</p><p>Новые правила направлены на защиту прав участников рынка и предотвращение незаконной деятельности.</p>',
          category: 'regulation',
          published: true,
          publishedAt: new Date(Date.now() - 86400000), // 1 day ago
          views: 0
        },
        {
          title: 'Криптоконференция AURVA Summit 2024',
          slug: 'aurva-summit-2024',
          excerpt: 'Приглашаем всех участников криптоиндустрии на первую ежегодную конференцию AURVA Summit.',
          content: '<p>AURVA организует первую крупную конференцию по криптовалютам и блокчейну в Центральной Азии.</p><p>На конференции выступят ведущие эксперты отрасли, представители регуляторов и успешные предприниматели.</p>',
          category: 'events',
          published: true,
          publishedAt: new Date(Date.now() - 172800000), // 2 days ago
          views: 0
        },
        {
          title: 'Черновик: Анализ рынка Q1 2024',
          slug: 'draft-analiz-rynka-q1',
          excerpt: 'Аналитический отчет о состоянии криптовалютного рынка в первом квартале 2024 года.',
          content: '<p>Это черновик статьи с анализом рынка.</p>',
          category: 'analytics',
          published: false, // Unpublished draft
          views: 0
        }
      ]);
      console.log('✅ News articles seeded (3 published, 1 draft)');
    } else {
      console.log(`ℹ️  News already exists (${newsCount} articles)`);
    }

    // Seed Members
    console.log('🏢 Seeding member companies...');
    const membersCount = await Member.count();
    if (membersCount === 0) {
      await Member.bulkCreate([
        {
          name: 'CryptoExchange KG',
          slug: 'cryptoexchange-kg',
          description: 'Ведущая криптовалютная биржа Кыргызстана',
          website: 'https://cryptoexchange.kg',
          isActive: true,
          displayOrder: 1,
          joinedDate: new Date('2023-06-01')
        },
        {
          name: 'BlockChain Solutions',
          slug: 'blockchain-solutions',
          description: 'Разработка блокчейн-решений для бизнеса',
          website: 'https://blockchain-solutions.kg',
          isActive: true,
          displayOrder: 2,
          joinedDate: new Date('2023-07-15')
        },
        {
          name: 'Crypto Mining KG',
          slug: 'crypto-mining-kg',
          description: 'Профессиональный майнинг криптовалют',
          website: 'https://cryptomining.kg',
          isActive: true,
          displayOrder: 3,
          joinedDate: new Date('2023-08-20')
        },
        {
          name: 'Digital Assets Consulting',
          slug: 'digital-assets-consulting',
          description: 'Консалтинг в сфере цифровых активов',
          website: 'https://da-consulting.kg',
          isActive: false, // Inactive member
          displayOrder: 4,
          joinedDate: new Date('2023-05-10')
        }
      ]);
      console.log('✅ Member companies seeded (3 active, 1 inactive)');
    } else {
      console.log(`ℹ️  Members already exist (${membersCount} companies)`);
    }

    // Seed Contacts (sample submissions)
    console.log('📧 Seeding contact submissions...');
    const contactsCount = await Contact.count();
    if (contactsCount === 0) {
      await Contact.bulkCreate([
        {
          name: 'Иван Петров',
          email: 'ivan.petrov@example.com',
          phone: '+996 555 123456',
          notes: 'Компания: TechStart KG. Вопрос: Интересуемся вступлением в AURVA. Можете предоставить информацию об условиях членства?',
          status: 'new'
        },
        {
          name: 'Мария Сидорова',
          email: 'maria.sidorova@crypto.kg',
          phone: '+996 700 987654',
          notes: 'Компания: CryptoInvest. Вопрос: Хотим узнать о предстоящих мероприятиях и конференциях AURVA.',
          status: 'new'
        },
        {
          name: 'Алексей Иванов',
          email: 'alexey@blockchain.kg',
          phone: '+996 777 555333',
          notes: 'Компания: BlockChain KG. Вопрос: Просим разъяснений по новым правилам регулирования криптовалют.',
          status: 'contacted'
        },
        {
          name: 'Елена Смирнова',
          email: 'elena.smirnova@mail.kg',
          phone: '+996 550 111222',
          notes: 'Частное лицо, хочу получить консультацию по инвестированию в криптовалюты.',
          status: 'processed'
        }
      ]);
      console.log('✅ Contact submissions seeded (2 new, 1 contacted, 1 processed)');
    } else {
      console.log(`ℹ️  Contacts already exist (${contactsCount} submissions)`);
    }

    console.log('');
    console.log('✅ Sample data seeding completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   📰 News: ${await News.count()} total (${await News.count({ where: { published: true }})} published)`);
    console.log(`   🏢 Members: ${await Member.count()} total (${await Member.count({ where: { isActive: true }})} active)`);
    console.log(`   📧 Contacts: ${await Contact.count()} submissions`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
