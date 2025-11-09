import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminSeeder } from '../../database/seeds/admin.seeder';
import { SocialAuthService } from '../auth/services/social-auth.service';
import { ExpertModule } from '../expert/expert.module';
import { Users } from './entities/users.entity';
import { UsersRepository } from './repositories/users.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CloudinaryService } from '../../common/services/cloudinary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),
    ExpertModule, // Import ExpertModule to access ExpertService
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    SocialAuthService,
    AdminSeeder,
    CloudinaryService,
  ],
  exports: [
    UsersService,
    UsersRepository,
    SocialAuthService,
    AdminSeeder,
    CloudinaryService,
  ], // Export AdminSeeder so DatabaseService can use it
})
export class UsersModule {}
