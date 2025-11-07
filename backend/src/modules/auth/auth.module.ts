import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenManagerService } from 'src/common/services/token-manager.service';
import { Experts } from '../expert/entities/expert.entity';
import { ExpertModule } from '../expert/expert.module';
import { ExpertRepository } from '../expert/repositories';
import { Users } from '../users/entities/users.entity';
import { UsersRepository } from '../users/repositories/users.repository';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './strategies/google-oauth.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('jwt.secret'),
        signOptions: config.get('jwt.signOptions'),
      }),
    }),
    TypeOrmModule.forFeature([Users, Experts]),
    UsersModule,
    ExpertModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenManagerService,
    GoogleStrategy,
    JwtStrategy,
    UsersRepository,
    ExpertRepository,
  ],
  exports: [AuthService],
})
export class AuthModule {}
