import { getSupabaseClient, generateSlug } from '../config/supabase';
import dotenv from 'dotenv';

dotenv.config();

// ============ MEMBERS DATA (from aurva.kg) ============
const members = [
  {
    name: 'Envoys',
    description: 'Envoys - инновационная компания, специализирующаяся на блокчейн-технологиях и цифровых решениях для современного бизнеса.',
    website: 'https://envoys.vision/',
    logo_url: 'https://static.tildacdn.one/tild6165-3935-4238-b766-393266333636/A5_-_3.jpg',
    display_order: 1,
  },
  {
    name: 'Royal Inc.',
    description: 'Royal Inc. - инвестиционный холдинг и лицензированная криптовалютная компания, специализирующаяся на цифровых активах и платежных решениях.',
    website: 'https://www.royal.inc/',
    logo_url: 'https://static.tildacdn.one/tild6134-3135-4035-b864-646261356130/photo_2024-12-04_141.jpeg',
    display_order: 2,
  },
  {
    name: 'WeChange',
    description: 'WeChange - современный сервис обмена цифровых валют с удобным интерфейсом и конкурентными курсами.',
    website: 'https://www.wechange.kg/',
    logo_url: 'https://static.tildacdn.one/tild3134-6436-4130-a239-393831666532/photo_2025-09-11_183.jpeg',
    display_order: 3,
  },
  {
    name: 'KLN',
    description: 'KLN - компания, предоставляющая комплексные финансовые и технологические решения на рынке виртуальных активов.',
    website: 'https://kln.kg/',
    logo_url: 'https://static.tildacdn.one/tild3564-3437-4363-b366-386533666434/_.png',
    display_order: 4,
  },
  {
    name: 'Prime Finance',
    description: 'Prime Finance - финансовая компания, предоставляющая профессиональные услуги в сфере управления цифровыми активами и инвестиций.',
    website: 'https://primefinance.kg/',
    logo_url: 'https://static.tildacdn.one/tild3565-6661-4436-b262-363130616237/Logo_2.png',
    display_order: 5,
  },
  {
    name: 'BitHub',
    description: 'BitHub - ведущая платформа для работы с виртуальными активами в Кыргызстане.',
    website: 'https://bithub.kg/',
    logo_url: 'https://static.tildacdn.one/tild6462-6364-4861-b166-353964656433/__2025-06-16__145801.png',
    display_order: 6,
  },
  {
    name: 'CoinChange',
    description: 'CoinChange - платформа обмена криптовалют, предоставляющая удобные и безопасные решения для работы с цифровыми активами.',
    website: null,
    logo_url: 'https://static.tildacdn.one/tild3235-3661-4239-a133-386161636332/Asset-1.jpg',
    display_order: 7,
  },
  {
    name: 'Crypto Valley',
    description: 'Crypto Valley - компания, работающая в сфере виртуальных активов и блокчейн-технологий в Кыргызстане.',
    website: null,
    logo_url: 'https://static.tildacdn.one/tild3835-6464-4661-b939-393634633434/WhatsApp_Image_2025-.jpeg',
    display_order: 8,
  },
  {
    name: 'CryptoExchange',
    description: 'CryptoExchange - сервис обмена криптовалют с поддержкой множества цифровых активов.',
    website: null,
    logo_url: 'https://static.tildacdn.one/tild3635-3264-4365-b031-353737356330/_.jpg',
    display_order: 9,
  },
  {
    name: 'Digital Finance',
    description: 'Digital Finance - компания, предоставляющая финансовые услуги в сфере цифровых активов.',
    website: null,
    logo_url: 'https://static.tildacdn.one/tild3165-3239-4163-b533-386531356163/Instagram_post_-_2.jpg',
    display_order: 10,
  },
  {
    name: 'OSONX',
    description: 'OSONX - платформа для работы с виртуальными активами.',
    website: null,
    logo_url: 'https://static.tildacdn.one/tild3238-3932-4736-b237-623631323663/OSONX_W1.png',
    display_order: 11,
  },
];

// ============ NEWS DATA (from aurva.kg Tilda feed) ============
const news = [
  {
    title: 'АУРВА стала членом Международного Делового Совета',
    date: '2026-04-06 13:33',
    image_url: 'https://static.tildacdn.com/tild3565-6438-4130-a262-643431316430/Photo-171_resized.jpg',
    gallery: ['https://static.tildacdn.com/tild3565-6438-4130-a262-643431316430/Photo-171_resized.jpg','https://static.tildacdn.com/tild6361-6463-4661-b962-626239396137/Photo-49_resized.jpg','https://static.tildacdn.com/tild6639-6564-4235-a433-376135623335/Photo-128_resized.jpg','https://static.tildacdn.com/tild3464-3963-4264-b161-363365303730/Photo-178_resized.jpg','https://static.tildacdn.com/tild3135-3161-4334-a335-313661333535/Photo-51_resized.jpg'],
    category: 'events',
  },
  {
    title: 'Участие АУРВА на Crypto Jaz',
    date: '2026-03-29 17:55',
    image_url: 'https://static.tildacdn.com/tild6535-3932-4637-a563-333163303330/photo_2026-04-03_175.jpeg',
    gallery: ['https://static.tildacdn.com/tild6535-3932-4637-a563-333163303330/photo_2026-04-03_175.jpeg','https://static.tildacdn.com/tild6136-3236-4238-b232-383233656331/photo_2026-04-03_175.jpeg','https://static.tildacdn.com/tild6232-3439-4534-a437-373162333066/photo_2026-04-03_175.jpeg','https://static.tildacdn.com/tild3865-3339-4639-b136-366337306139/photo_2026-04-03_175.jpeg'],
    category: 'events',
  },
  {
    title: 'Избран новый состав Наблюдательного Совета АУРВА',
    date: '2026-02-24 16:50',
    image_url: 'https://static.tildacdn.com/tild3639-3533-4331-b263-333163666430/2026-02-24_165652.jpg',
    gallery: ['https://static.tildacdn.com/tild3639-3533-4331-b263-333163666430/2026-02-24_165652.jpg','https://static.tildacdn.com/tild6432-3931-4663-b637-353032623366/2026-02-24_165647.jpg','https://static.tildacdn.com/tild3139-3137-4230-a130-323831653738/2026-02-24_165656.jpg','https://static.tildacdn.com/tild6332-3163-4663-b733-616533353736/2026-02-24_165707.jpg','https://static.tildacdn.com/tild3764-3437-4365-b866-333539326465/2026-02-24_165703.jpg'],
    category: 'other',
  },
  {
    title: 'Бизнес Форум B5+1',
    date: '2026-02-09 11:52',
    image_url: 'https://static.tildacdn.com/tild6338-3230-4038-a533-623564646136/photo_2026-02-09_115.jpeg',
    gallery: ['https://static.tildacdn.com/tild6338-3230-4038-a533-623564646136/photo_2026-02-09_115.jpeg','https://static.tildacdn.com/tild6331-3535-4431-a262-333435643863/photo_2026-02-09_115.jpeg','https://static.tildacdn.com/tild3539-6231-4531-a166-666339333865/photo_2026-02-09_115.jpeg','https://static.tildacdn.com/tild6233-3430-4662-a462-333436393461/photo_2026-02-09_115.jpeg','https://static.tildacdn.com/tild3534-3036-4731-b966-353035376532/2026-02-09_115641.jpg'],
    category: 'events',
  },
  {
    title: 'Первое собрание Экспертного совета АУРВА в 2026 году',
    date: '2026-01-21 12:57',
    image_url: 'https://static.tildacdn.com/tild6631-3362-4261-a637-666564616630/photo_2026-01-21_125.jpeg',
    gallery: ['https://static.tildacdn.com/tild6631-3362-4261-a637-666564616630/photo_2026-01-21_125.jpeg','https://static.tildacdn.com/tild6434-6237-4532-a436-623365613033/photo_2026-01-21_125.jpeg'],
    category: 'events',
  },
  {
    title: 'Второй поток обучения бухгалтеров',
    date: '2025-12-22 14:08',
    image_url: 'https://static.tildacdn.com/tild3462-6434-4163-a130-336131323639/photo_2025-12-31_140.jpeg',
    gallery: ['https://static.tildacdn.com/tild3462-6434-4163-a130-336131323639/photo_2025-12-31_140.jpeg'],
    category: 'events',
  },
  {
    title: 'Второй поток обучения для комплаенс офицеров',
    date: '2025-12-14 17:42',
    image_url: 'https://static.tildacdn.com/tild3761-6334-4338-b730-346637656564/22222.jpeg',
    gallery: ['https://static.tildacdn.com/tild3761-6334-4338-b730-346637656564/22222.jpeg','https://static.tildacdn.com/tild3037-6663-4235-a262-323031383264/11111.jpeg'],
    category: 'events',
  },
  {
    title: 'Отчетный вечер АУРВА: итоги года',
    date: '2025-12-12 15:45',
    image_url: 'https://static.tildacdn.com/tild3337-6639-4235-a138-666632323962/IMG_9351.JPG',
    gallery: ['https://static.tildacdn.com/tild3337-6639-4235-a138-666632323962/IMG_9351.JPG','https://static.tildacdn.com/tild3030-3739-4839-b932-643932303762/WhatsApp_Image_2025-.jpeg','https://static.tildacdn.com/tild3663-3338-4634-b030-363436313034/IMG_9371.JPG','https://static.tildacdn.com/tild6134-6163-4862-b162-393438303535/IMG_9350.JPG','https://static.tildacdn.com/tild3235-3864-4332-b064-366438373766/IMG_9353.JPG'],
    category: 'events',
  },
  {
    title: 'Decentral Asia Forum 2025',
    date: '2025-11-20 16:44',
    image_url: 'https://static.tildacdn.com/tild3363-3930-4034-b032-343231323638/photo_2025-11-20_164.jpeg',
    gallery: ['https://static.tildacdn.com/tild3363-3930-4034-b032-343231323638/photo_2025-11-20_164.jpeg','https://static.tildacdn.com/tild6533-6466-4562-b739-366135353237/DSC06822.jpg','https://static.tildacdn.com/tild3538-6564-4562-a134-313836373163/DSC06865.jpg','https://static.tildacdn.com/tild3838-3235-4930-b063-383232353562/DSC06909.jpg'],
    category: 'events',
  },
  {
    title: 'Обучение бухгалтеров',
    date: '2025-11-15 18:47',
    image_url: 'https://static.tildacdn.com/tild3235-3734-4433-a563-643866633033/photo_2025-11-17_184.jpeg',
    gallery: ['https://static.tildacdn.com/tild3235-3734-4433-a563-643866633033/photo_2025-11-17_184.jpeg'],
    category: 'events',
  },
  {
    title: 'Первый день рождения Ассоциации',
    date: '2025-10-14 12:54',
    image_url: 'https://static.tildacdn.com/tild3164-3032-4139-b065-663165353365/RU.png',
    gallery: ['https://static.tildacdn.com/tild3164-3032-4139-b065-663165353365/RU.png'],
    category: 'events',
  },
  {
    title: 'Обучение новых комплаенс-офицеров',
    date: '2025-10-08 14:01',
    image_url: 'https://static.tildacdn.com/tild3337-3636-4935-a264-303862356562/photo_2025-10-08_140.jpeg',
    gallery: ['https://static.tildacdn.com/tild3337-3636-4935-a264-303862356562/photo_2025-10-08_140.jpeg'],
    category: 'events',
  },
  {
    title: 'Меморандум о сотрудничестве с Госфиннадзором КР',
    date: '2025-09-16 12:25',
    image_url: 'https://static.tildacdn.com/tild6532-3432-4466-b664-316233316362/photo_2025-09-16_122.jpeg',
    gallery: ['https://static.tildacdn.com/tild6532-3432-4466-b664-316233316362/photo_2025-09-16_122.jpeg'],
    category: 'regulation',
  },
  {
    title: 'Научно-практическая конференция по противодействию отмыванию денег',
    date: '2025-09-08 15:33',
    image_url: 'https://static.tildacdn.com/tild3263-3436-4563-a565-306130303463/photo_2025-09-08_153.jpeg',
    gallery: ['https://static.tildacdn.com/tild3263-3436-4563-a565-306130303463/photo_2025-09-08_153.jpeg'],
    category: 'events',
  },
  {
    title: 'Подписание меморандума с ПВТ КР',
    date: '2025-09-04 15:24',
    image_url: 'https://static.tildacdn.com/tild3833-6530-4932-a331-303732646331/DSC00140ARW.jpg',
    gallery: ['https://static.tildacdn.com/tild3833-6530-4932-a331-303732646331/DSC00140ARW.jpg'],
    category: 'regulation',
  },
  {
    title: 'Встреча членов Ассоциации',
    date: '2025-09-03 18:53',
    image_url: 'https://static.tildacdn.com/tild6135-3134-4238-b861-356231636138/photo_2025-09-04_185.jpeg',
    gallery: ['https://static.tildacdn.com/tild6135-3134-4238-b861-356231636138/photo_2025-09-04_185.jpeg'],
    category: 'events',
  },
  {
    title: 'XXI Евразийский Облигационный конгресс 2025',
    date: '2025-06-27 10:24',
    image_url: 'https://static.tildacdn.com/tild3032-3131-4563-b134-353961353564/photo_2025-07-09_102.jpeg',
    gallery: ['https://static.tildacdn.com/tild3032-3131-4563-b134-353961353564/photo_2025-07-09_102.jpeg'],
    category: 'events',
  },
  {
    title: 'АУРВА подписала меморандум с Ассоциацией цифровой устойчивости',
    date: '2025-06-26 14:42',
    image_url: 'https://static.tildacdn.com/tild3733-3966-4236-b737-623936316663/IMG_2045.jpg',
    gallery: ['https://static.tildacdn.com/tild3733-3966-4236-b737-623936316663/IMG_2045.jpg'],
    category: 'regulation',
  },
  {
    title: 'Союз банков Кыргызстана и АУРВА',
    date: '2025-06-18 12:23',
    image_url: 'https://static.tildacdn.com/tild3537-6566-4534-a534-653737613064/photo_2025-06-19_122.jpeg',
    gallery: ['https://static.tildacdn.com/tild3537-6566-4534-a534-653737613064/photo_2025-06-19_122.jpeg'],
    category: 'regulation',
  },
  {
    title: 'АУРВА на Втором Форуме аналитических центров ЦА и Республики Корея',
    date: '2025-06-13 14:58',
    image_url: 'https://static.tildacdn.com/tild3732-6363-4232-b237-646431313033/1.jpg',
    gallery: ['https://static.tildacdn.com/tild3732-6363-4232-b237-646431313033/1.jpg'],
    category: 'events',
  },
  {
    title: 'Ассоциация на BIFF 2025',
    date: '2025-06-12 11:30',
    image_url: 'https://static.tildacdn.com/tild6639-3865-4563-b239-653961393564/0071.jpg',
    gallery: ['https://static.tildacdn.com/tild6639-3865-4563-b239-653961393564/0071.jpg','https://static.tildacdn.com/tild3039-3735-4866-b531-303265386661/0413.jpg','https://static.tildacdn.com/tild6462-3930-4166-b532-313733393862/0420.jpg','https://static.tildacdn.com/tild3161-3466-4638-b762-336532613664/0461.jpg'],
    category: 'events',
  },
  {
    title: 'Панельная сессия: «Цифровые активы - перспективы развития финансовых систем»',
    date: '2025-06-05 16:15',
    image_url: 'https://static.tildacdn.com/tild3033-3034-4561-a463-313665323564/photo_2025-06-05_161.jpeg',
    gallery: ['https://static.tildacdn.com/tild3033-3034-4561-a463-313665323564/photo_2025-06-05_161.jpeg','https://static.tildacdn.com/tild6266-3332-4737-b337-653337646631/photo_2025-06-05_161.jpeg','https://static.tildacdn.com/tild6632-6661-4735-b066-633261346664/photo_2025-06-05_161.jpeg'],
    category: 'analytics',
  },
  {
    title: 'КИТ форум: Круглый стол',
    date: '2025-05-29 12:00',
    image_url: 'https://static.tildacdn.com/tild3163-3465-4032-a134-656164343338/photo_2025-06-02_132.jpeg',
    gallery: ['https://static.tildacdn.com/tild3163-3465-4032-a134-656164343338/photo_2025-06-02_132.jpeg','https://static.tildacdn.com/tild3930-6161-4161-b839-323933386361/2025-06-02_132734.jpg'],
    category: 'events',
  },
  {
    title: 'АУРВА провела встречу с рабочей группой бухгалтеров',
    date: '2025-05-22 16:26',
    image_url: 'https://static.tildacdn.com/tild3032-3464-4462-a338-653263373338/2025-05-27_162541.jpg',
    gallery: ['https://static.tildacdn.com/tild3032-3464-4462-a338-653263373338/2025-05-27_162541.jpg','https://static.tildacdn.com/tild3566-3039-4234-b835-326230323766/2025-05-27_162545.jpg'],
    category: 'events',
  },
  {
    title: 'Ассоциация на Республиканской Олимпиаде по финансовой безопасности',
    date: '2025-04-23 15:16',
    image_url: 'https://static.tildacdn.com/tild3039-3439-4639-a231-376233666432/photo_2025-04-29_151.jpeg',
    gallery: ['https://static.tildacdn.com/tild3039-3439-4639-a231-376233666432/photo_2025-04-29_151.jpeg','https://static.tildacdn.com/tild6432-3535-4335-b563-656339383762/photo_2025-04-29_151.jpeg'],
    category: 'events',
  },
  {
    title: 'Встреча участников рынка виртуальных активов',
    date: '2025-04-21 17:16',
    image_url: 'https://static.tildacdn.com/tild3566-6663-4830-b233-323037343763/2025-04-21_171506.jpg',
    gallery: ['https://static.tildacdn.com/tild3566-6663-4830-b233-323037343763/2025-04-21_171506.jpg'],
    category: 'events',
  },
  {
    title: 'Собрание бухгалтеров',
    date: '2025-04-07 14:58',
    image_url: 'https://static.tildacdn.com/tild3865-6664-4165-b238-336463356134/photo_2025-04-08_145.jpeg',
    gallery: ['https://static.tildacdn.com/tild3865-6664-4165-b238-336463356134/photo_2025-04-08_145.jpeg'],
    category: 'events',
  },
  {
    title: 'Подписание меморандума о сотрудничестве между АУРВА и Учебным центром ГСФР при Министерстве финансов КР',
    date: '2025-04-01 16:47',
    image_url: 'https://static.tildacdn.com/tild6334-3966-4264-a634-306137643333/photo_2025-04-03_164.jpeg',
    gallery: ['https://static.tildacdn.com/tild6334-3966-4264-a634-306137643333/photo_2025-04-03_164.jpeg','https://static.tildacdn.com/tild3162-6366-4231-a132-373264646436/photo_2025-04-03_164.jpeg','https://static.tildacdn.com/tild3739-3938-4266-b765-363732396564/photo_2025-04-03_164.jpeg'],
    category: 'regulation',
  },
  {
    title: 'Встреча с ГНС',
    date: '2025-03-26 14:53',
    image_url: 'https://static.tildacdn.com/tild3532-3066-4539-a164-643139333665/photo_2025-04-08_145.jpeg',
    gallery: ['https://static.tildacdn.com/tild3532-3066-4539-a164-643139333665/photo_2025-04-08_145.jpeg'],
    category: 'regulation',
  },
  {
    title: 'Новый Председатель АУРВА',
    date: '2025-03-26 12:55',
    image_url: 'https://static.tildacdn.com/tild6636-3163-4232-a566-663034313734/2025-03-26_125642.jpg',
    gallery: ['https://static.tildacdn.com/tild6636-3163-4232-a566-663034313734/2025-03-26_125642.jpg'],
    category: 'other',
  },
  {
    title: 'АУРВА на Digital Kyrgyzstan 2025!',
    date: '2025-02-27 12:47',
    image_url: 'https://static.tildacdn.com/tild6664-3766-4333-b863-366132643063/DSC05940.jpg',
    gallery: ['https://static.tildacdn.com/tild6664-3766-4333-b863-366132643063/DSC05940.jpg','https://static.tildacdn.com/tild3365-3732-4939-b932-333337336364/DSC05782.jpg','https://static.tildacdn.com/tild3564-3066-4636-a431-653433643538/DSC05930.jpg'],
    category: 'events',
  },
  {
    title: 'Встреча с ФКБ',
    date: '2025-02-07 17:11',
    image_url: 'https://static.tildacdn.com/tild6238-6666-4636-b464-396431313238/photo_2025-02-12_171.jpeg',
    gallery: ['https://static.tildacdn.com/tild6238-6666-4636-b464-396431313238/photo_2025-02-12_171.jpeg'],
    category: 'regulation',
  },
  {
    title: 'Первая отчетная встреча членов Ассоциации',
    date: '2025-02-05 17:09',
    image_url: 'https://static.tildacdn.com/tild6635-3032-4563-a665-363962343433/IMG_6324.PNG',
    gallery: ['https://static.tildacdn.com/tild6635-3032-4563-a665-363962343433/IMG_6324.PNG'],
    category: 'events',
  },
  {
    title: 'Встреча бухгалтеров резидентов Ассоциации',
    date: '2025-02-04 17:07',
    image_url: 'https://static.tildacdn.com/tild6330-3530-4364-a263-653965333131/photo_2025-02-12_170.jpeg',
    gallery: ['https://static.tildacdn.com/tild6330-3530-4364-a263-653965333131/photo_2025-02-12_170.jpeg'],
    category: 'events',
  },
  {
    title: 'Встреча с экспертом по анализу блокчейна и крипторасследованиям',
    date: '2024-12-07 17:05',
    image_url: 'https://static.tildacdn.com/tild6237-3264-4261-b061-613932356339/2025-02-12_170544.jpg',
    gallery: ['https://static.tildacdn.com/tild6237-3264-4261-b061-613932356339/2025-02-12_170544.jpg'],
    category: 'analytics',
  },
  {
    title: 'Бизнес-завтрак с представителями государственных структур',
    date: '2024-11-29 09:00',
    image_url: 'https://static.tildacdn.com/tild3163-3133-4662-b061-363461396132/WhatsApp_Image_2024-.jpeg',
    gallery: ['https://static.tildacdn.com/tild3163-3133-4662-b061-363461396132/WhatsApp_Image_2024-.jpeg'],
    category: 'regulation',
  },
  {
    title: 'Первая официальная встреча членов Ассоциации',
    date: '2024-10-30 15:03',
    image_url: 'https://static.tildacdn.com/tild6332-3632-4235-b766-623862343833/photo_2024-12-04_114.jpeg',
    gallery: ['https://static.tildacdn.com/tild6332-3632-4235-b766-623862343833/photo_2024-12-04_114.jpeg','https://static.tildacdn.com/tild6262-6562-4765-a361-333064326131/photo_2024-12-04_114.jpeg','https://static.tildacdn.com/tild3162-3930-4030-b165-393938356534/photo_2024-12-04_114.jpeg'],
    category: 'events',
  },
  {
    title: 'Встреча-знакомство с председателем Ассоциации виртуальных активов',
    date: '2024-10-30 15:00',
    image_url: 'https://static.tildacdn.com/tild3961-3434-4362-a532-383166623935/photo_2024-12-04_112.jpeg',
    gallery: ['https://static.tildacdn.com/tild3961-3434-4362-a532-383166623935/photo_2024-12-04_112.jpeg'],
    category: 'events',
  },
];

function transliterate(text: string): string {
  const map: Record<string, string> = {
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh',
    'з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o',
    'п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts',
    'ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
  };
  return text.toLowerCase().split('').map(c => map[c] || c).join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function importAll() {
  const supabase = getSupabaseClient();

  console.log('🚀 Starting import from aurva.kg...\n');

  // ============ IMPORT MEMBERS ============
  console.log('👥 Importing members...');

  // Clear existing members
  const { error: delMemErr } = await supabase.from('members').delete().neq('id', 0);
  if (delMemErr) console.warn('Warning clearing members:', delMemErr.message);

  for (const m of members) {
    const slug = transliterate(m.name);
    const { data, error } = await supabase.from('members').insert({
      name: m.name,
      slug,
      description: m.description,
      website: m.website,
      logo_url: m.logo_url,
      is_active: true,
      display_order: m.display_order,
      joined_date: new Date('2024-01-01').toISOString(),
    }).select().single();

    if (error) {
      console.error(`  ❌ ${m.name}: ${error.message}`);
    } else {
      console.log(`  ✅ ${m.name} (id: ${data.id})`);
    }
  }

  // ============ IMPORT NEWS ============
  console.log('\n📰 Importing news...');

  // Clear existing news images first, then news
  const { error: delImgErr } = await supabase.from('news_images').delete().neq('id', 0);
  if (delImgErr) console.warn('Warning clearing news_images:', delImgErr.message);

  const { error: delNewsErr } = await supabase.from('news').delete().neq('id', 0);
  if (delNewsErr) console.warn('Warning clearing news:', delNewsErr.message);

  for (const n of news) {
    const slug = transliterate(n.title).substring(0, 200);
    const publishedAt = new Date(n.date.replace(' ', 'T') + ':00+06:00').toISOString();

    const { data, error } = await supabase.from('news').insert({
      title: n.title,
      slug,
      excerpt: n.title,
      content: `<p>${n.title}</p>`,
      category: n.category,
      image_url: n.image_url,
      published: true,
      published_at: publishedAt,
      views: 0,
    }).select().single();

    if (error) {
      console.error(`  ❌ ${n.title}: ${error.message}`);
      continue;
    }

    console.log(`  ✅ ${n.title} (id: ${data.id})`);

    // Insert gallery images into news_images
    if (n.gallery && n.gallery.length > 0) {
      const images = n.gallery.map((url, idx) => ({
        news_id: data.id,
        image_url: url,
        display_order: idx,
      }));

      const { error: imgErr } = await supabase.from('news_images').insert(images);
      if (imgErr) {
        console.error(`    ⚠️ Gallery error: ${imgErr.message}`);
      } else {
        console.log(`    📸 ${images.length} gallery images added`);
      }
    }
  }

  console.log('\n🎉 Import complete!');
  console.log(`   Members: ${members.length}`);
  console.log(`   News: ${news.length}`);
  process.exit(0);
}

importAll().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
