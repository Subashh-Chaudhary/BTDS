// src/auth/services/social-auth.service.ts
import { Injectable } from '@nestjs/common';
import { ExpertService } from 'src/modules/expert/expert.service';
import { CreateSocialUserDto } from 'src/modules/users/dtos/create-user.dto';
import { UsersRepository } from 'src/modules/users/repositories/users.repository';

@Injectable()
export class SocialAuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly expertService: ExpertService,
  ) {}

  async authenticate(profile: CreateSocialUserDto) {
    // Check if social user exists in users table
    const user = await this.usersRepository.findBySocialId(
      profile.auth_provider,
      profile.provider_id,
    );

    if (user) return user;

    // Check if social user exists in experts table
    const expert = await this.expertService.findByProviderId(
      profile.auth_provider,
      profile.provider_id,
    );

    if (expert) return expert;

    // Create new social user in users table (default behavior)
    return this.usersRepository.createSocialUser(profile);
  }
}
