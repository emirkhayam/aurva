import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Use PostgreSQL in production (Vercel), SQLite for local development
const isProduction = process.env.NODE_ENV === 'production';
const DATABASE_URL = process.env.POSTGRES_URL || process.env.DATABASE_URL;

const sequelize = isProduction && DATABASE_URL
  ? new Sequelize(DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      }
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '../../database.sqlite'),
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      }
    });

export const connectDatabase = async (): Promise<Sequelize> => {
  try {
    // Import models to ensure they're registered before sync
    await import('../models');

    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync all models with database (force: false to avoid data loss)
    await sequelize.sync({ force: false });
    console.log('✅ Database models synchronized.');

    // Initialize default settings
    const { initializeDefaultSettings } = await import('../controllers/siteSettingsController');
    await initializeDefaultSettings();

    return sequelize;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

export default sequelize;
