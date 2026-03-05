import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Use PostgreSQL in production (Vercel), SQLite for local development
const isProduction = process.env.NODE_ENV === 'production';
const DATABASE_URL = process.env.POSTGRES_URL || process.env.DATABASE_URL;

// Build DATABASE_URL from individual env vars if not provided
const buildDatabaseUrl = () => {
  const { POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD } = process.env;
  if (POSTGRES_HOST && POSTGRES_USER && POSTGRES_PASSWORD && POSTGRES_DB) {
    return `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT || 5432}/${POSTGRES_DB}`;
  }
  return null;
};

const connectionUrl = DATABASE_URL || buildDatabaseUrl();

const sequelize = isProduction && connectionUrl
  ? new Sequelize(connectionUrl, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: process.env.POSTGRES_SSL !== 'false' ? {
          require: true,
          rejectUnauthorized: false
        } : false
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
