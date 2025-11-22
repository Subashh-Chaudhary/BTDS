// src/auth/auth.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthHelper } from "src/common/helpers";
import {
  comparePasswords,
  hashPassword,
} from "src/common/helpers/password.helper";
import { IUserData, UserWithPassword } from "src/common/interfaces";
import { TokenManagerService } from "src/common/services/token-manager.service";
import { Repository } from "typeorm";
import { Experts } from "../expert/entities/expert.entity";
import { ExpertService } from "../expert/expert.service";
import { ExpertRepository } from "../expert/repositories";
import { Users } from "../users/entities/users.entity";
import { UsersRepository } from "../users/repositories/users.repository";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dtos/login.dto";
import { RegisterDto } from "./dtos/register.dto";

/**
 * Auth Service
 * Handles JWT token generation, authentication logic, and user registration
 */
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private expertService: ExpertService,
    private tokenManager: TokenManagerService,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    @InjectRepository(Experts)
    private expertsRepository: Repository<Experts>,
    private usersRepo: UsersRepository,
    private expertRepo: ExpertRepository
  ) {}

  /**
   * Register a new user
   * @param registerDto - Registration data
   * @returns Object containing user data and access token
   */
  async register(registerDto: RegisterDto): Promise<{
    user: Record<string, unknown>;
    access_token: string;
  }> {
    // Check if email already exists in either users or experts table
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    const existingExpert = await this.expertService.findByEmail(
      registerDto.email
    );

    if (existingExpert || existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    if (registerDto.password !== registerDto.confirm_password) {
      throw new BadRequestException(
        "Password and confirm password do not match"
      );
    }

    // Always create a normal user. Experts/admins are seeded or created
    // through internal/admin flows.
    const user = await this.createUser(registerDto);

    // Generate JWT token for the new user
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    const access_token = this.jwtService.sign(payload);

    // Return user data (excluding password) and token
    // Fetch full user record (from users or experts) so we return all user fields
    let fullUser: any = null;
    try {
      fullUser = await this.usersService.findById(String(user.id));
    } catch (e) {
      // not a regular user, try expert
      fullUser = await this.expertService.findById(String(user.id));
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pwd, ...userWithoutPassword } = fullUser;

    return {
      user: userWithoutPassword as Record<string, unknown>,
      access_token,
    };
  }

  /**
   * Create a new user (user)
   * @param userData - User registration data
   * @returns Created user object
   */
  private async createUser(userData: RegisterDto): Promise<Users> {
    // Hash the password
    const hashedPassword = await hashPassword(userData.password);

    // Generate verification token
    const verificationToken = this.tokenManager.generateVerificationToken();

    // Create user entity
    const user = this.usersRepository.create({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      is_verified: false,
      verification_token: verificationToken.token,
      verification_token_expires_at: verificationToken.expiresAt,
    });

    return this.usersRepository.save(user);
  }

  /**
   * Create a new expert
   * @param userData - Expert registration data
   * @returns Created expert object
   */
  private async createExpert(userData: RegisterDto): Promise<Experts> {
    // Hash the password
    const hashedPassword = await hashPassword(userData.password);

    // Generate verification token
    const verificationToken = this.tokenManager.generateVerificationToken();

    // Create expert entity
    const expert = this.expertsRepository.create({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      is_verified: false,
      is_active: true,
      verification_token: verificationToken.token,
      verification_token_expires_at: verificationToken.expiresAt,
    });

    return this.expertsRepository.save(expert);
  }

  /**
   * Authenticate user with email and password
   * @param loginDto - Login credentials
   * @returns Object containing user data and access token
   */
  async login(
    loginDto: LoginDto
  ): Promise<{ user: Record<string, unknown>; access_token: string }> {
    // Find user by email in both tables
    const user = await this.findUserByEmail(loginDto.email);
    if (!user) {
      throw new BadRequestException("Invalid credentials");
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(
      loginDto.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new BadRequestException("Invalid credentials");
    }

    // Update last login time for experts
    if (user.id && (await this.expertService.findByEmail(loginDto.email))) {
      await this.expertRepo.updateLastLogin(user.id.toString());
    }

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    const access_token = this.jwtService.sign(payload);
    // Fetch full user record (from users or experts) so we return all user fields
    let fullUser: any = null;
    try {
      fullUser = await this.usersService.findById(String(user.id));
    } catch (e) {
      // not a regular user, try expert
      fullUser = await this.expertService.findById(String(user.id));
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pwd, ...userWithoutPassword } = fullUser;

    return {
      user: userWithoutPassword as Record<string, unknown>,
      access_token,
    };
  }

  /**
   * Verify user email with verification token
   * @param token - Verification token
   * @returns Success message
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    // Find user by verification token
    const user = await AuthHelper.findUserByVerificationToken(
      token,
      this.usersRepository,
      this.expertsRepository
    );
    if (!user) {
      throw new BadRequestException("Invalid verification token");
    }

    // Validate token
    const validation = this.tokenManager.validateToken(
      user.verification_token,
      user.verification_token_expires_at
    );

    if (!validation.isValid) {
      throw new BadRequestException(
        validation.message || "Token is invalid or expired"
      );
    }

    // Mark user as verified and clear token
    await AuthHelper.updateUserVerification(
      user,
      this.usersRepository,
      this.expertsRepository
    );

    return { message: "Email verified successfully" };
  }

  /**
   * Request password reset
   * @param email - User email
   * @returns Success message
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    // Find user by email
    const user = await this.findUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return {
        message: "If the email exists, a password reset link has been sent",
      };
    }

    // Generate password reset token
    const resetToken = this.tokenManager.generatePasswordResetToken();

    // Determine whether this email belongs to an expert
    const expert = await this.expertService.findByEmail(email);
    if (expert) {
      await this.expertRepo.updatePasswordResetToken(
        expert.id.toString(),
        resetToken.token,
        resetToken.expiresAt
      );
    } else {
      await this.usersRepo.updatePasswordResetToken(
        user.id.toString(),
        resetToken.token,
        resetToken.expiresAt
      );
    }

    // TODO: Send email with reset link
    return {
      message: "If the email exists, a password reset link has been sent",
    };
  }

  /**
   * Reset password with reset token
   * @param token - Password reset token
   * @param newPassword - New password
   * @returns Success message
   */
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    // Find user by reset token
    const user = await AuthHelper.findUserByResetToken(
      token,
      this.usersRepository,
      this.expertsRepository
    );
    if (!user) {
      throw new BadRequestException("Invalid reset token");
    }

    // Validate token
    const validation = this.tokenManager.validateToken(
      user.password_reset_token,
      user.reset_token_expires_at
    );

    if (!validation.isValid) {
      throw new BadRequestException(
        validation.message || "Token is invalid or expired"
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password and clear reset token
    await AuthHelper.updateUserPassword(
      user,
      hashedPassword,
      this.usersRepository,
      this.expertsRepository
    );

    return { message: "Password reset successfully" };
  }

  /**
   * Refresh JWT token
   * @param refreshToken - Refresh token
   * @returns New access token
   */
  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    // Find user by refresh token
    const user = await AuthHelper.findUserByRefreshToken(
      refreshToken,
      this.usersRepository,
      this.expertsRepository
    );
    if (!user) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    // Validate token
    const validation = this.tokenManager.validateToken(
      user.refresh_token,
      user.refresh_token_expires_at
    );

    if (!validation.isValid) {
      throw new UnauthorizedException(
        validation.message || "Refresh token is invalid or expired"
      );
    }

    // Generate new access token
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    const access_token = this.jwtService.sign(payload);

    return { access_token };
  }

  /**
   * Find user by email across all user tables
   * @param email - Email to search for
   * @returns User with password or undefined
   */
  private async findUserByEmail(
    email: string
  ): Promise<UserWithPassword | undefined> {
    // Check in users table
    const user = await this.usersService.findByEmail(email);
    if (user) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        password: user.password,
      };
    }

    // Check in experts table
    const expert = await this.expertService.findByEmail(email);
    if (expert) {
      return {
        id: expert.id,
        email: expert.email,
        name: expert.name,
        password: expert.password,
      };
    }

    return undefined;
  }

  /**
   * Generate JWT token for user
   * @param user - User data
   * @returns JWT token
   */
  generateToken(user: IUserData): string {
    return AuthHelper.generateToken(user, this.jwtService);
  }

  /**
   * Return the full user/expert record by id (password stripped)
   * @param id - user id
   */
  async getFullUserById(id: string): Promise<Record<string, unknown>> {
    let fullUser: any = null;
    try {
      fullUser = await this.usersService.findById(id);
    } catch (e) {
      fullUser = await this.expertService.findById(id);
    }

    // Strip password if present
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pwd, ...userWithoutPassword } = fullUser;
    return userWithoutPassword as Record<string, unknown>;
  }

  /**
   * Verify JWT token
   * @param token - JWT token to verify
   * @returns Decoded token payload
   */
  verifyToken(token: string): any {
    return AuthHelper.verifyToken(token, this.jwtService);
  }

  /**
   * Verify password against hashed password
   * @param plainPassword - Plain text password
   * @param hashedPassword - Hashed password
   * @returns Boolean indicating if password is valid
   */
  private async verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return comparePasswords(plainPassword, hashedPassword);
  }
}
