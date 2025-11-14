import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
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
    const logger = new Logger(JwtStrategy.name);
    logger.debug(`JWT payload received: sub=${(payload as any).sub} email=${(payload as any).email}`);
    // Ensure payload.sub is a valid UUID before querying the DB. If it's not,
    // return unauthorized rather than allowing TypeORM to throw a QueryFailedError.
    const sub = payload.sub?.toString();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (sub && uuidRegex.test(sub)) {
      // Safe to query by UUID id. Wrap queries in try/catch to avoid DB errors bubbling up.
      try {
        const user = await this.usersRepository.findById(sub);
        if (user) return user;
      } catch (err) {
        logger.warn(`usersRepository.findById failed for sub=${sub}: ${err?.message ?? err}`);
      }

      try {
        const expert = await this.expertRepository.findById(sub);
        if (expert) return expert;
      } catch (err) {
        logger.warn(`expertRepository.findById failed for sub=${sub}: ${err?.message ?? err}`);
      }
    } else {
      // Fallback: token may come from legacy system with numeric 'sub'.
      // Try to resolve by email if available in the token payload.
      const email = (payload as any).email;
      if (email && typeof email === 'string') {
        try {
          const userByEmail = await this.usersRepository.findByEmail(email);
          if (userByEmail) return userByEmail;
        } catch (err) {
          logger.warn(`usersRepository.findByEmail failed for email=${email}: ${err?.message ?? err}`);
        }

        try {
          const expertByEmail = await this.expertRepository.findByEmail(email as string);
          if (expertByEmail) return expertByEmail;
        } catch (err) {
          logger.warn(`expertRepository.findByEmail failed for email=${email}: ${err?.message ?? err}`);
        }
      }
    }

    throw new UnauthorizedException();
  }
}
