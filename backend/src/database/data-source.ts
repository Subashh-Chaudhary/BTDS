import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { Experts } from '../modules/expert/entities/expert.entity';
import { Users } from '../modules/users/entities/users.entity';
import { Scan } from '../modules/scans/entities/scan.entity';
import { Prediction } from '../modules/predictions/entities/prediction.entity';
import { Treatment } from '../modules/treatments/entities/treatment.entity';

// Load environment variables
config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Experts, Users, Scan, Prediction, Treatment],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
