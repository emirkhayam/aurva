import { Application } from 'express';
import { Sequelize } from 'sequelize';
import createApp from '../../app';
import { connectDatabase } from '../../config/database';

let sequelize: Sequelize;

export const setupTestApp = async (): Promise<Application> => {
  // Connect to test database (sync is done inside connectDatabase)
  sequelize = await connectDatabase();

  // Force sync to clear database before each test suite
  await sequelize.sync({ force: true });

  // Create and return app
  return createApp();
};

export const teardownTestApp = async (): Promise<void> => {
  if (sequelize) {
    await sequelize.close();
  }
};

export { sequelize };
