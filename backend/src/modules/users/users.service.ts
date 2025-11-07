import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hashPassword } from 'src/common/helpers/password.helper';
import { Repository } from 'typeorm';
import { CreateSocialUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Users } from './entities/users.entity';
import { UsersRepository } from './repositories/users.repository';

/**
 * Users Service
 * Handles all user-related business logic including CRUD operations
 * Note: Registration is handled in the auth module
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    private readonly usersRepository: UsersRepository,
  ) {}

  /**
   * Find user by ID
   * @param id - User ID
   * @returns User object or throws NotFoundException
   */
  async findById(id: string): Promise<Users> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Find user by email
   * @param email - User email
   * @returns User object or undefined if not found
   */
  async findByEmail(email: string): Promise<Users | undefined> {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    return user || undefined;
  }

  /**
   * Get all users with pagination
   * @param page - Page number
   * @param limit - Number of items per page
   * @returns Object containing users array and pagination metadata
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    users: Users[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      users,
      total,
      page,
      limit,
    };
  }

  /**
   * Update user by ID
   * @param id - User ID
   * @param updateData - Data to update
   * @returns Updated user object
   */
  async updateUser(id: string, updateData: UpdateUserDto): Promise<Users> {
    // Check if updateData is empty or contains no valid data
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new BadRequestException('No data provided for update');
    }

    // Filter out undefined, null, and empty string values
    const filteredData: Partial<UpdateUserDto> = Object.fromEntries(
      Object.entries(updateData).filter(
        ([, value]) => value !== undefined && value !== null && value !== '',
      ),
    ) as Partial<UpdateUserDto>;

    if (Object.keys(filteredData).length === 0) {
      throw new BadRequestException('No valid data provided for update');
    }

    const user = await this.findById(id);

    // Check if email is being updated and if it already exists
    if (filteredData.email && filteredData.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: filteredData.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash password if it's being updated
    if (filteredData.password) {
      filteredData.password = await hashPassword(filteredData.password);
    }

    // Update user
    await this.userRepository.update(id, filteredData);

    // Return updated user
    return this.findById(id);
  }

  /**
   * Delete user by ID
   * @param id - User ID
   * @returns Success message
   */
  async deleteUser(id: string): Promise<{ message: string }> {
    const user = await this.findById(id);
    await this.userRepository.remove(user);

    return { message: 'User deleted successfully' };
  }

  /**
   * Find user by social provider and social ID
   * @param provider - Social provider (e.g., 'google', 'facebook')
   * @param socialId - Social ID from the provider
   * @returns User object or undefined if not found
   */
  async findBySocialId(
    provider: string,
    socialId: string,
  ): Promise<Users | undefined> {
    const user = await this.userRepository.findOne({
      where: { auth_provider: provider, provider_id: socialId },
    });
    return user || undefined;
  }

  /**
   * Create a new social user
   * @param profile - Social user profile data
   * @returns Created user object
   */
  async createSocialUser(profile: CreateSocialUserDto): Promise<Users> {
    // Check if profile is empty or contains no valid data
    if (!profile || Object.keys(profile).length === 0) {
      throw new BadRequestException('No data provided for user creation');
    }

    // Check if all provided values are undefined or null
    const hasValidData = Object.values(profile).some(
      (value) => value !== undefined && value !== null && value !== '',
    );

    if (!hasValidData) {
      throw new BadRequestException('No valid data provided for user creation');
    }

    const user = this.userRepository.create({
      ...profile,
      is_verified: true, // Social users are typically verified
      is_active: true,
    });

    return this.userRepository.save(user);
  }
}
