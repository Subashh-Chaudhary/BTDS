import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSocialUserDto } from '../dtos/create-user.dto';
import { Users } from '../entities/users.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {}

  /**
   * Find user by email
   * @param email - User email
   * @returns User object or undefined if not found
   */
  async findByEmail(email: string): Promise<Users | undefined> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user || undefined;
  }

  /**
   * Find user by ID
   * @param id - User ID
   * @returns User object or undefined if not found
   */
  async findById(id: string): Promise<Users | undefined> {
    const user = await this.userRepository.findOne({ where: { id } });
    return user || undefined;
  }

  /**
   * Find user by verification token
   * @param token - Verification token
   * @returns User object or undefined if not found
   */
  async findByVerificationToken(token: string): Promise<Users | undefined> {
    const user = await this.userRepository.findOne({
      where: { verification_token: token },
    });
    return user || undefined;
  }

  /**
   * Find user by password reset token
   * @param token - Password reset token
   * @returns User object or undefined if not found
   */
  async findByPasswordResetToken(token: string): Promise<Users | undefined> {
    const user = await this.userRepository.findOne({
      where: { password_reset_token: token },
    });
    return user || undefined;
  }

  /**
   * Find user by refresh token
   * @param token - Refresh token
   * @returns User object or undefined if not found
   */
  async findByRefreshToken(token: string): Promise<Users | undefined> {
    const user = await this.userRepository.findOne({
      where: { refresh_token: token },
    });
    return user || undefined;
  }

  /**
   * Find user by social provider
   * @param provider - Authentication provider
   * @param providerId - Provider-specific user ID
   * @returns User object or undefined if not found
   */
  async findBySocialProvider(
    provider: string,
    providerId: string,
  ): Promise<Users | undefined> {
    const user = await this.userRepository.findOne({
      where: { auth_provider: provider, provider_id: providerId },
    });
    return user || undefined;
  }

  /**
   * Create a new user
   * @param userData - User data
   * @returns Created user object
   */
  async create(userData: Partial<Users>): Promise<Users> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  /**
   * Save user changes
   * @param user - User object to save
   * @returns Saved user object
   */
  async save(user: Users): Promise<Users> {
    return this.userRepository.save(user);
  }

  /**
   * Update user by ID
   * @param id - User ID
   * @param updateData - Data to update
   * @returns Update result
   */
  async update(id: string, updateData: Partial<Users>): Promise<any> {
    return this.userRepository.update(id, updateData);
  }

  /**
   * Update user verification status
   * @param id - User ID
   * @param isVerified - Verification status
   * @param verificationToken - Verification token
   * @param expiresAt - Token expiration time
   * @returns Update result
   */
  async updateVerificationStatus(
    id: string,
    isVerified: boolean,
    verificationToken?: string,
    expiresAt?: Date,
  ): Promise<any> {
    return this.userRepository.update(id, {
      is_verified: isVerified,
      verification_token: verificationToken,
      verification_token_expires_at: expiresAt,
    });
  }

  /**
   * Update user password reset token
   * @param id - User ID
   * @param resetToken - Password reset token
   * @param expiresAt - Token expiration time
   * @returns Update result
   */
  async updatePasswordResetToken(
    id: string,
    resetToken: string,
    expiresAt: Date,
  ): Promise<any> {
    return this.userRepository.update(id, {
      password_reset_token: resetToken,
      reset_token_expires_at: expiresAt,
    });
  }

  /**
   * Update user password
   * @param id - User ID
   * @param hashedPassword - Hashed password
   * @returns Update result
   */
  async updatePassword(id: string, hashedPassword: string): Promise<any> {
    return this.userRepository.update(id, {
      password: hashedPassword,
      password_reset_token: undefined,
      reset_token_expires_at: undefined,
    });
  }

  /**
   * Update user last login time
   * @param id - User ID
   * @returns Update result
   */
  async updateLastLogin(id: string): Promise<any> {
    return this.userRepository.update(id, {
      last_login_at: new Date(),
    });
  }

  /**
   * Get all users with pagination
   * @param page - Page number
   * @param limit - Number of items per page
   * @returns Object containing users array and total count
   */
  async findAllWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<[Users[], number]> {
    const skip = (page - 1) * limit;
    return this.userRepository.findAndCount({
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get all active users
   * @returns Array of active users
   */
  async findAllActive(): Promise<Users[]> {
    return this.userRepository.find({
      where: { is_active: true },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get all verified users
   * @returns Array of verified users
   */
  async findAllVerified(): Promise<Users[]> {
    return this.userRepository.find({
      where: { is_verified: true, is_active: true },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Delete user by ID
   * @param id - User ID
   * @returns Delete result
   */
  async delete(id: string): Promise<any> {
    return this.userRepository.delete(id);
  }

  /**
   * Soft delete user by ID (mark as inactive)
   * @param id - User ID
   * @returns Update result
   */
  async softDelete(id: string): Promise<any> {
    return this.userRepository.update(id, { is_active: false });
  }

  /**
   * Find user by social ID (legacy method for backward compatibility)
   * @param provider - Authentication provider
   * @param socialId - Provider-specific user ID
   * @returns User object or undefined if not found
   */
  async findBySocialId(
    provider: string,
    socialId: string,
  ): Promise<Users | undefined> {
    return this.findBySocialProvider(provider, socialId);
  }

  /**
   * Create social user (legacy method for backward compatibility)
   * @param profile - Social user profile data
   * @returns Created user object
   */
  async createSocialUser(profile: CreateSocialUserDto): Promise<Users> {
    const user = this.userRepository.create(profile);
    return this.userRepository.save(user);
  }
}
