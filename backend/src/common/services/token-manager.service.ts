import { Injectable } from '@nestjs/common';
import { randomBytes, randomUUID } from 'crypto';

export interface UserTokens {
  verification_token?: string | null;
  verification_token_expires_at?: Date | null;
  password_reset_token?: string | null;
  reset_token_expires_at?: Date | null;
  refresh_token?: string | null;
  refresh_token_expires_at?: Date | null;
}

export interface TokenData {
  token: string;
  expiresAt: Date;
}

export interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  message?: string;
}

@Injectable()
export class TokenManagerService {
  /**
   * Generate a secure verification token
   * @param expiryHours - Hours until token expires (default: 24)
   * @returns TokenData object with token and expiration
   */
  generateVerificationToken(expiryHours: number = 24): TokenData {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiryHours);

    return { token, expiresAt };
  }

  /**
   * Generate a secure password reset token
   * @param expiryHours - Hours until token expires (default: 1)
   * @returns TokenData object with token and expiration
   */
  generatePasswordResetToken(expiryHours: number = 1): TokenData {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiryHours);

    return { token, expiresAt };
  }

  /**
   * Generate a secure refresh token
   * @param expiryDays - Days until token expires (default: 7)
   * @returns TokenData object with token and expiration
   */
  generateRefreshToken(expiryDays: number = 7): TokenData {
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    return { token, expiresAt };
  }

  /**
   * Validate if a token is still valid and not expired
   * @param token - Token to validate
   * @param expiresAt - Expiration timestamp
   * @returns TokenValidationResult object
   */
  validateToken(token: string, expiresAt: Date): TokenValidationResult {
    if (!token || !expiresAt) {
      return {
        isValid: false,
        isExpired: true,
        message: 'Token or expiration date is missing',
      };
    }

    const now = new Date();
    const isExpired = now > expiresAt;

    if (isExpired) {
      return {
        isValid: false,
        isExpired: true,
        message: 'Token has expired',
      };
    }

    return {
      isValid: true,
      isExpired: false,
    };
  }

  /**
   * Check if a token is expired
   * @param expiresAt - Expiration timestamp
   * @returns boolean indicating if token is expired
   */
  isTokenExpired(expiresAt: Date | null | undefined): boolean {
    if (!expiresAt) return true;
    return new Date() > expiresAt;
  }

  /**
   * Get time remaining until token expires
   * @param expiresAt - Expiration timestamp
   * @returns Time remaining in milliseconds (negative if expired)
   */
  getTimeRemaining(expiresAt: Date): number {
    if (!expiresAt) return -1;
    return expiresAt.getTime() - new Date().getTime();
  }

  /**
   * Clean expired tokens from user data
   * @param user - User object with token fields
   * @returns Cleaned user object with expired tokens removed
   */
  cleanExpiredTokens(user: UserTokens): UserTokens {
    const cleanedUser: UserTokens = { ...user };

    // Clean verification token
    if (
      cleanedUser.verification_token &&
      this.isTokenExpired(cleanedUser.verification_token_expires_at)
    ) {
      cleanedUser.verification_token = null;
      cleanedUser.verification_token_expires_at = null;
    }

    // Clean password reset token
    if (
      cleanedUser.password_reset_token &&
      this.isTokenExpired(cleanedUser.reset_token_expires_at)
    ) {
      cleanedUser.password_reset_token = null;
      cleanedUser.reset_token_expires_at = null;
    }

    // Clean refresh token
    if (
      cleanedUser.refresh_token &&
      this.isTokenExpired(cleanedUser.refresh_token_expires_at)
    ) {
      cleanedUser.refresh_token = null;
      cleanedUser.refresh_token_expires_at = null;
    }

    return cleanedUser;
  }
}
