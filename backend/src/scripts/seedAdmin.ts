import dotenv from 'dotenv';
import sequelize from '../config/database';
import { User } from '../models';

dotenv.config();

const seedAdmin = async () => {
  try {
    console.log('🌱 Starting admin user seeding...');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync models
    await sequelize.sync();
    console.log('✅ Models synchronized');

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: { email: process.env.ADMIN_EMAIL || 'admin@aurva.kg' }
    });

    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      email: process.env.ADMIN_EMAIL || 'admin@aurva.kg',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      name: 'AURVA Administrator',
      role: 'admin',
      isActive: true
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password:', process.env.ADMIN_PASSWORD || 'admin123');
    console.log('⚠️  IMPORTANT: Change the default password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
