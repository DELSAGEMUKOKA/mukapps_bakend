import syncDatabase from '../../config/syncDatabase.js';
import seedDemoCompany from './01-demo-company.js';
import logger from '../../utils/logger.js';

const runSeeders = async () => {
  try {
    console.log('Starting database seeding...\n');

    await syncDatabase();

    await seedDemoCompany();

    console.log('All seeders completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
};

runSeeders();
