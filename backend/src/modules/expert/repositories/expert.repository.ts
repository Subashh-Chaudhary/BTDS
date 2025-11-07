import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Experts } from '../entities/expert.entity';

@Injectable()
export class ExpertRepository {
  constructor(
    @InjectRepository(Experts)
    private readonly expertRepository: Repository<Experts>,
  ) {}

  /**
   * Find expert by ID
   * @param id - Expert ID
   * @returns Expert object or undefined if not found
   */
  async findById(id: string): Promise<Experts | undefined> {
    const expert = await this.expertRepository.findOne({
      where: { id },
    });
    return expert || undefined;
  }

  /**
   * Find expert by email
   * @param email - Expert email
   * @returns Expert object or undefined if not found
   */
  async findByEmail(email: string): Promise<Experts | undefined> {
    const expert = await this.expertRepository.findOne({
      where: { email },
    });
    return expert || undefined;
  }

  /**
   * Find expert by verification token
   * @param token - Verification token
   * @returns Expert object or undefined if not found
   */
  async findByVerificationToken(token: string): Promise<Experts | undefined> {
    const expert = await this.expertRepository.findOne({
      where: { verification_token: token },
    });
    return expert || undefined;
  }

  /**
   * Find expert by password reset token
   * @param token - Password reset token
   * @returns Expert object or undefined if not found
   */
  async findByPasswordResetToken(token: string): Promise<Experts | undefined> {
    const expert = await this.expertRepository.findOne({
      where: { password_reset_token: token },
    });
    return expert || undefined;
  }

  /**
   * Find expert by refresh token
   * @param token - Refresh token
   * @returns Expert object or undefined if not found
   */
  async findByRefreshToken(token: string): Promise<Experts | undefined> {
    const expert = await this.expertRepository.findOne({
      where: { refresh_token: token },
    });
    return expert || undefined;
  }

  /**
   * Find expert by social provider
   * @param provider - Authentication provider
   * @param providerId - Provider-specific user ID
   * @returns Expert object or undefined if not found
   */
  async findBySocialProvider(
    provider: string,
    providerId: string,
  ): Promise<Experts | undefined> {
    const expert = await this.expertRepository.findOne({
      where: { auth_provider: provider, provider_id: providerId },
    });
    return expert || undefined;
  }

  /**
   * Create a new expert
   * @param expertData - Expert data
   * @returns Created expert object
   */
  async create(expertData: Partial<Experts>): Promise<Experts> {
    const expert = this.expertRepository.create(expertData);
    return this.expertRepository.save(expert);
  }

  /**
   * Save expert changes
   * @param expert - Expert object to save
   * @returns Saved expert object
   */
  async save(expert: Experts): Promise<Experts> {
    return this.expertRepository.save(expert);
  }

  /**
   * Update expert by ID
   * @param id - Expert ID
   * @param updateData - Data to update
   * @returns Update result
   */
  async update(id: string, updateData: Partial<Experts>): Promise<any> {
    return this.expertRepository.update(id, updateData);
  }

  /**
   * Update expert verification status
   * @param id - Expert ID
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
    return this.expertRepository.update(id, {
      is_verified: isVerified,
      verification_token: verificationToken,
      verification_token_expires_at: expiresAt,
    });
  }

  /**
   * Update expert password reset token
   * @param id - Expert ID
   * @param resetToken - Password reset token
   * @param expiresAt - Token expiration time
   * @returns Update result
   */
  async updatePasswordResetToken(
    id: string,
    resetToken: string,
    expiresAt: Date,
  ): Promise<any> {
    return this.expertRepository.update(id, {
      password_reset_token: resetToken,
      reset_token_expires_at: expiresAt,
    });
  }

  /**
   * Update expert password
   * @param id - Expert ID
   * @param hashedPassword - Hashed password
   * @returns Update result
   */
  async updatePassword(id: string, hashedPassword: string): Promise<any> {
    return this.expertRepository.update(id, {
      password: hashedPassword,
      password_reset_token: undefined,
      reset_token_expires_at: undefined,
    });
  }

  /**
   * Update expert last login time
   * @param id - Expert ID
   * @returns Update result
   */
  async updateLastLogin(id: string): Promise<any> {
    return this.expertRepository.update(id, {
      last_login_at: new Date(),
    });
  }

  /**
   * Get all experts with pagination
   * @param page - Page number
   * @param limit - Number of items per page
   * @returns Object containing experts array and total count
   */
  async findAllWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<[Experts[], number]> {
    const skip = (page - 1) * limit;
    return this.expertRepository.findAndCount({
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get all active experts
   * @returns Array of active experts
   */
  async findAllActive(): Promise<Experts[]> {
    return this.expertRepository.find({
      where: { is_active: true },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get all verified experts
   * @returns Array of verified experts
   */
  async findAllVerified(): Promise<Experts[]> {
    return this.expertRepository.find({
      where: { is_verified: true, is_active: true },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Delete expert by ID
   * @param id - Expert ID
   * @returns Delete result
   */
  async delete(id: string): Promise<any> {
    return this.expertRepository.delete(id);
  }

  /**
   * Soft delete expert by ID (mark as inactive)
   * @param id - Expert ID
   * @returns Update result
   */
  async softDelete(id: string): Promise<any> {
    return this.expertRepository.update(id, { is_active: false });
  }
}
