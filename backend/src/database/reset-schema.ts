import { AppDataSource } from './data-source';

async function resetSchema() {
  try {
    const dataSource = await AppDataSource.initialize();
    console.log('Dropping database schema...');
    await dataSource.dropDatabase();
    console.log('Database schema dropped');

    console.log('Running migrations...');
    await dataSource.runMigrations();
    console.log('Migrations completed');

    await dataSource.destroy();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetSchema();
