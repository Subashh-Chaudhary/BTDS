import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config.';
import cloudinaryConfig from './config/cloudinary.config';
import mlConfig from './config/ml.config';
import jwtConfig from './config/jwt.config';
import { envValidationSchema } from './config/env.validation';
import { DatabaseService } from './database/database.provider';
import { AuthModule } from './modules/auth/auth.module';
import { ExpertModule } from './modules/expert/expert.module';
import { UsersModule } from './modules/users/users.module';
import { HistoriesModule } from './modules/histories/histories.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ScansModule } from './modules/scans/scans.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: { expiresIn: '1h' },
      }),
      global: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, cloudinaryConfig, mlConfig, jwtConfig],
      validationSchema: envValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const logger = new Logger('Database');

        try {
          const dbConfig = config.get<TypeOrmModuleOptions>('database');
          if (!dbConfig) throw new Error('Database config not found');

          logger.log('Attempting database connection...');
          return {
            ...dbConfig,
            retryAttempts: 3,
            retryDelay: 3000,
            logging: true,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            logger.error(`Database configuration error: ${error.message}`);
          } else {
            logger.error('Unknown database configuration error');
          }
          throw error;
        }
      },
    }),
    UsersModule,
    ExpertModule,
    AuthModule,
    HistoriesModule,
    ReportsModule,
    ScansModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}
