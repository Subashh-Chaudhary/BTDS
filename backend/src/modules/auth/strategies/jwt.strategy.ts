import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersRepository } from '../../users/repositories/users.repository';
import { ExpertRepository } from '../../expert/repositories';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersRepository: UsersRepository,
    private expertRepository: ExpertRepository,
    private configService: ConfigService,
  ) {
    const secret = configService.get<string>('jwt.secret');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    // Try to find the user in both repositories
    const user = await this.usersRepository.findById(payload.sub);
    if (user) {
      return user;
    }

    const expert = await this.expertRepository.findById(payload.sub);
    if (expert) {
      return expert;
    }

    throw new UnauthorizedException();
  }
}
