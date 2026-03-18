import { connectDatabase } from '../config/database';
import { Member } from '../models';
import logger from '../utils/logger';

const members = [
  {
    name: 'BitHub',
    description: 'BitHub - ведущая платформа для работы с виртуальными активами в Кыргызстане. Предоставляет безопасные и надежные решения для обмена цифровых активов.',
    website: 'https://bithub.kg/',
    logoUrl: 'https://optim.tildacdn.one/tild6462-6364-4861-b166-353964656433/-/resize/302x/-/format/webp/__2025-06-16__145801.png.webp',
    isActive: true,
    displayOrder: 1,
    joinedDate: new Date('2024-01-15')
  },
  {
    name: 'Envoys',
    description: 'Envoys - инновационная компания, специализирующаяся на блокчейн-технологиях и цифровых решениях для современного бизнеса.',
    website: 'https://envoys.vision/',
    logoUrl: 'https://optim.tildacdn.one/tild6165-3935-4238-b766-393266333636/-/resize/302x/-/format/webp/A5_-_3.jpg.webp',
    isActive: true,
    displayOrder: 2,
    joinedDate: new Date('2024-02-20')
  },
  {
    name: 'Royal Inc.',
    description: 'Royal Inc. - инвестиционный холдинг и лицензированная криптовалютная компания, специализирующаяся на цифровых активах и платежных решениях.',
    website: 'https://www.royal.inc/',
    logoUrl: 'https://optim.tildacdn.one/tild6134-3135-4035-b864-646261356130/-/resize/302x/-/format/webp/photo_2024-12-04_141.jpeg.webp',
    isActive: true,
    displayOrder: 3,
    joinedDate: new Date('2024-03-10')
  },
  {
    name: 'KLN',
    description: 'KLN - компания, предоставляющая комплексные финансовые и технологические решения на рынке виртуальных активов.',
    website: 'https://kln.kg/#contact',
    logoUrl: 'https://optim.tildacdn.one/tild3564-3437-4363-b366-386533666434/-/resize/302x/-/format/webp/_.png.webp',
    isActive: true,
    displayOrder: 4,
    joinedDate: new Date('2024-04-05')
  },
  {
    name: 'WeChange',
    description: 'WeChange - современный сервис обмена цифровых валют с удобным интерфейсом и конкурентными курсами.',
    website: 'https://www.wechange.kg/',
    logoUrl: 'https://optim.tildacdn.one/tild3134-6436-4130-a239-393831666532/-/resize/302x/-/format/webp/photo_2025-09-11_183.jpeg.webp',
    isActive: true,
    displayOrder: 5,
    joinedDate: new Date('2024-05-12')
  },
  {
    name: 'Prime Finance',
    description: 'Prime Finance - финансовая компания, предоставляющая профессиональные услуги в сфере управления цифровыми активами и инвестиций.',
    website: 'https://primefinance.kg/',
    logoUrl: 'https://optim.tildacdn.one/tild3565-6661-4436-b262-363130616237/-/resize/302x/-/format/webp/Logo_2.png.webp',
    isActive: true,
    displayOrder: 6,
    joinedDate: new Date('2024-06-18')
  }
];

async function seedMembers() {
  try {
    await connectDatabase();
    logger.info('Starting to seed members...');

    // Check if members already exist
    const existingMembers = await Member.findAll();

    if (existingMembers.length > 0) {
      logger.info(`Database already has ${existingMembers.length} members. Skipping seed.`);
      logger.info('If you want to re-seed, delete existing members first.');
      process.exit(0);
    }

    // Create all members
    for (const memberData of members) {
      // Generate slug from name
      const slug = memberData.name
        .toLowerCase()
        .replace(/[^а-яёa-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const member = await Member.create({
        ...memberData,
        slug
      });
      logger.info(`✅ Created member: ${member.name}`);
    }

    logger.info(`\n🎉 Successfully seeded ${members.length} members!`);
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error seeding members:', error);
    process.exit(1);
  }
}

seedMembers();
