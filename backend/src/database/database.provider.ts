import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AdminSeeder } from './seeds/admin.seeder';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger('Database');

  constructor(
    private readonly dataSource: DataSource,
    private readonly adminSeeder: AdminSeeder,
  ) {}

  async onModuleInit() {
    try {
      await this.dataSource.query('SELECT 1');
      this.logger.log('✅ Database connection established');

      // Run admin seeder
      await this.adminSeeder.seed();
      this.logger.log('✅ Admin seeder completed');
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`❌ Database connection failed: ${error.message}`);
      } else {
        this.logger.error('❌ Database connection failed: Unknown error');
      }
      process.exit(1);
    }
  }
}
