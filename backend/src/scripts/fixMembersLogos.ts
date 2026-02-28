import { connectDatabase } from '../config/database';
import { Member } from '../models';
import logger from '../utils/logger';

const correctMapping = {
  'BitHub': 'https://optim.tildacdn.one/tild6165-3935-4238-b766-393266333636/-/resize/302x/-/format/webp/A5_-_3.jpg.webp',
  'Envoys': 'https://optim.tildacdn.one/tild6134-3135-4035-b864-646261356130/-/resize/302x/-/format/webp/photo_2024-12-04_141.jpeg.webp',
  'Royal Inc.': 'https://optim.tildacdn.one/tild3134-6436-4130-a239-393831666532/-/resize/302x/-/format/webp/photo_2025-09-11_183.jpeg.webp',
  'KLN': 'https://optim.tildacdn.one/tild3564-3437-4363-b366-386533666434/-/resize/302x/-/format/webp/_.png.webp',
  'WeChange': 'https://optim.tildacdn.one/tild3565-6661-4436-b262-363130616237/-/resize/302x/-/format/webp/Logo_2.png.webp',
  'Prime Finance': 'https://optim.tildacdn.one/tild6462-6364-4861-b166-353964656433/-/resize/302x/-/format/webp/__2025-06-16__145801.png.webp'
};

async function fixLogos() {
  try {
    await connectDatabase();
    logger.info('Starting to fix member logos...');

    for (const [name, logoUrl] of Object.entries(correctMapping)) {
      const member = await Member.findOne({ where: { name } });

      if (member) {
        member.logoUrl = logoUrl;
        await member.save();
        logger.info(`✅ Updated logo for: ${name}`);
      } else {
        logger.warn(`⚠️  Member not found: ${name}`);
      }
    }

    logger.info('\n🎉 Successfully fixed all member logos!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error fixing logos:', error);
    process.exit(1);
  }
}

fixLogos();
