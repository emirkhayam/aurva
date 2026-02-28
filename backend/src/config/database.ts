import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Use SQLite for easy setup (no MySQL installation required)
const sequelize = new Sequelize({
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
