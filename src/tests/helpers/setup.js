import { sequelize } from '../../models/index.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

beforeAll(async () => {
  try {
    await sequelize.authenticate();
    console.log('Test database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to test database:', error);
    throw error;
  }
});

beforeEach(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

global.testTimeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));
