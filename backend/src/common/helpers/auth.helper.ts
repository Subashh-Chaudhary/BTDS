import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Experts } from '../../modules/expert/entities/expert.entity';
import { Users } from '../../modules/users/entities/users.entity';
import { IUserData } from '../interfaces';

/**
 * Auth Helper Service
 * Contains helper functions for authentication operations
 */
export class AuthHelper {
  /**
   * Find user by verification token across all user tables
   * @param token - Verification token
   * @param usersRepository - Users repository
   * @param expertsRepository - Experts repository
   * @returns User with user_type or undefined
   */
  static async findUserByVerificationToken(
    token: string,
    usersRepository: Repository<Users>,
    expertsRepository: Repository<Experts>,
  ): Promise<
    | {
        id: string;
        user_type: string;
        verification_token: string;
        verification_token_expires_at: Date;
      }
    | undefined
  > {
    // Check in users table
    const user = await usersRepository.findOne({
      where: { verification_token: token },
    });
    if (user) {
      return {
        id: user.id,
        user_type: 'user',
        verification_token: user.verification_token,
        verification_token_expires_at: user.verification_token_expires_at,
      };
    }

    // Check in experts table
    const expert = await expertsRepository.findOne({
      where: { verification_token: token },
    });
    if (expert) {
      return {
        id: expert.id,
        user_type: 'expert',
        verification_token: expert.verification_token,
        verification_token_expires_at: expert.verification_token_expires_at,
      };
    }

    return undefined;
  }

  /**
   * Find user by reset token across all user tables
   * @param token - Reset token
   * @param usersRepository - Users repository
   * @param expertsRepository - Experts repository
   * @returns User with user_type or undefined
   */
  static async findUserByResetToken(
    token: string,
    usersRepository: Repository<Users>,
    expertsRepository: Repository<Experts>,
  ): Promise<
    | {
        id: string;
        user_type: string;
        password_reset_token: string;
        reset_token_expires_at: Date;
      }
    | undefined
  > {
    // Check in users table
    const user = await usersRepository.findOne({
      where: { password_reset_token: token },
    });
    if (user) {
      return {
        id: user.id,
        user_type: 'user',
        password_reset_token: user.password_reset_token,
        reset_token_expires_at: user.reset_token_expires_at,
      };
    }

    // Check in experts table
    const expert = await expertsRepository.findOne({
      where: { password_reset_token: token },
    });
    if (expert) {
      return {
        id: expert.id,
        user_type: 'expert',
        password_reset_token: expert.password_reset_token,
        reset_token_expires_at: expert.reset_token_expires_at,
      };
    }

    return undefined;
  }

  /**
   * Find user by refresh token across all user tables
   * @param token - Refresh token
   * @param usersRepository - Users repository
   * @param expertsRepository - Experts repository
   * @returns User with user_type or undefined
   */
  static async findUserByRefreshToken(
    token: string,
    usersRepository: Repository<Users>,
    expertsRepository: Repository<Experts>,
  ): Promise<
    | {
        id: string;
        user_type: string;
        refresh_token: string;
        refresh_token_expires_at: Date;
        email: string;
        name: string;
      }
    | undefined
  > {
    // Check in users table
    const user = await usersRepository.findOne({
      where: { refresh_token: token },
    });
    if (user) {
      return {
        id: user.id,
        user_type: 'user',
        refresh_token: user.refresh_token,
        refresh_token_expires_at: user.refresh_token_expires_at,
        email: user.email,
        name: user.name,
      };
    }

    // Check in experts table
    const expert = await expertsRepository.findOne({
      where: { refresh_token: token },
    });
    if (expert) {
      return {
        id: expert.id,
        user_type: 'expert',
        refresh_token: expert.refresh_token,
        refresh_token_expires_at: expert.refresh_token_expires_at,
        email: expert.email,
        name: expert.name,
      };
    }

    return undefined;
  }

  /**
   * Generate JWT token for user
   * @param user - User data
   * @param jwtService - JWT service instance
   * @returns JWT token
   */
  static generateToken(user: IUserData, jwtService: JwtService): string {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    return jwtService.sign(payload);
  }

  /**
   * Verify JWT token
   * @param token - JWT token to verify
   * @param jwtService - JWT service instance
   * @returns Decoded token payload
   */
  static verifyToken(token: string, jwtService: JwtService): any {
    try {
      return jwtService.verify(token);
    } catch {
      throw new BadRequestException('Invalid token');
    }
  }

  /**
   * Update user verification status and clear token
   * @param user - User data with user_type
   * @param usersRepository - Users repository
   * @param expertsRepository - Experts repository
   */
  static async updateUserVerification(
    user: {
      id: string;
      user_type: string;
    },
    usersRepository: Repository<Users>,
    expertsRepository: Repository<Experts>,
  ): Promise<void> {
    if (user.user_type === 'expert') {
      await expertsRepository.update(user.id, {
        is_verified: true,
        verification_token: undefined,
        verification_token_expires_at: undefined,
      });
    } else {
      await usersRepository.update(user.id, {
        is_verified: true,
        verification_token: undefined,
        verification_token_expires_at: undefined,
      });
    }
  }

  /**
   * Update user password reset token
   * @param user - User data with user_type
   * @param resetToken - Password reset token
   * @param expiresAt - Token expiration time
   * @param usersRepository - Users repository
   * @param expertsRepository - Experts repository
   */
  static async updateUserResetToken(
    user: {
      id: string;
      user_type: string;
    },
    resetToken: string,
    expiresAt: Date,
    usersRepository: Repository<Users>,
    expertsRepository: Repository<Experts>,
  ): Promise<void> {
    if (user.user_type === 'expert') {
      await expertsRepository.update(user.id, {
        password_reset_token: resetToken,
        reset_token_expires_at: expiresAt,
      });
    } else {
      await usersRepository.update(user.id, {
        password_reset_token: resetToken,
        reset_token_expires_at: expiresAt,
      });
    }
  }

  /**
   * Update user password and clear reset token
   * @param user - User data with user_type
   * @param hashedPassword - Hashed password
   * @param usersRepository - Users repository
   * @param expertsRepository - Experts repository
   */
  static async updateUserPassword(
    user: {
      id: string;
      user_type: string;
    },
    hashedPassword: string,
    usersRepository: Repository<Users>,
    expertsRepository: Repository<Experts>,
  ): Promise<void> {
    if (user.user_type === 'expert') {
      await expertsRepository.update(user.id, {
        password: hashedPassword,
        password_reset_token: undefined,
        reset_token_expires_at: undefined,
      });
    } else {
      await usersRepository.update(user.id, {
        password: hashedPassword,
        password_reset_token: undefined,
        reset_token_expires_at: undefined,
      });
    }
  }

  /**
   * Update expert last login time
   * @param expertId - Expert ID
   * @param expertsRepository - Experts repository
   */
  static async updateExpertLastLogin(
    expertId: string,
    expertsRepository: Repository<Experts>,
  ): Promise<void> {
    await expertsRepository.update(expertId, {
      last_login_at: new Date(),
    });
  }
}
