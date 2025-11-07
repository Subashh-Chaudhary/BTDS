// src/auth/strategies/google-oauth.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { IGoogleProfile } from 'src/common/interfaces';
import { SocialAuthService } from '../services/social-auth.service';

/**
 * Google OAuth Strategy
 * Handles Google OAuth authentication flow
 * Maps Google profile to our user model and creates/retrieves user
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly socialAuthService: SocialAuthService) {
    // Ensure environment variables are properly typed
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackURL =
      process.env.GOOGLE_CALLBACK_URL ||
      'http://localhost:3000/api/auth/google/callback';

    if (!clientID || !clientSecret) {
      throw new Error('Google OAuth credentials not configured');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  /**
   * Validate method called after Google OAuth authentication
   * Maps Google profile to our user model and handles user creation/retrieval
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: IGoogleProfile,
    done: VerifyCallback,
  ): Promise<void> {
    try {
      // Extract user information from Google profile
      const { name, emails, photos } = profile;

      // Create social user profile
      const socialUserProfile = {
        email: emails[0]?.value || '',
        name: `${name.givenName} ${name.familyName}`.trim(),
        auth_provider: 'google',
        provider_id: profile.id,
        avatar_url: photos[0]?.value,
      };

      // Use social auth service to authenticate/create user
      const user = await this.socialAuthService.authenticate(socialUserProfile);

      // Return user data to be stored in session/request
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        auth_provider: 'google',
        provider_id: profile.id,
        accessToken,
        refreshToken,
      };

      // Call done with null error and user data
      done(null, userData);
    } catch (error) {
      // Handle any errors during user creation/retrieval
      const authError =
        error instanceof Error ? error : new Error('Authentication failed');
      // Call done with error and false for user
      done(authError, false);
    }
  }
}
