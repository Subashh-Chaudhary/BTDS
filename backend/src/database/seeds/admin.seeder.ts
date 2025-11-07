import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hashPassword } from '../../common/helpers/password.helper';
import { UsersRepository } from '../../modules/users/repositories/users.repository';

@Injectable()
export class AdminSeeder {
  constructor(
    private usersRepository: UsersRepository,
    private configService: ConfigService,
  ) {}

  /**
   * Create default admin user
   * This should be called during application startup
   */
  async seed(): Promise<void> {
    try {
      // Get admin credentials from environment variables
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
      const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');
      const adminName = this.configService.get<string>('ADMIN_NAME');
      const adminPhone = this.configService.get<string>('ADMIN_PHONE');
      const adminAddress = this.configService.get<string>('ADMIN_ADDRESS');

      // Validate required environment variables
      if (!adminEmail || !adminPassword) {
        console.error(
          '❌ Admin credentials not found in environment variables',
        );
        console.error(
          'Please set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file',
        );
        return;
      }

      // Check if admin already exists
      const existingAdmin = await this.usersRepository.findByEmail(adminEmail);

      if (existingAdmin) {
        console.log('✅ Admin user already exists, skipping seed');
        return;
      }

      // Create admin user
      const hashedPassword = await hashPassword(adminPassword);

      await this.usersRepository.create({
        name: adminName || 'System Administrator',
        email: adminEmail,
        password: hashedPassword,
        is_verified: true, // Admin is pre-verified
        phone: adminPhone || '+1234567890',
        address: adminAddress || 'System Address',
        is_admin: true,
      });

      console.log('✅ Admin user created successfully');
      console.log(`📧 Admin Email: ${adminEmail}`);
    } catch (error) {
      console.error('❌ Error creating admin user:', error);
      throw error;
    }
  }

  /**
   * Get admin credentials for testing
   * @returns Admin credentials from environment variables
   */
  getAdminCredentials(): { email: string; password: string } {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (!adminEmail || !adminPassword) {
      throw new Error('Admin credentials not found in environment variables');
    }

    return {
      email: adminEmail,
      password: adminPassword,
    };
  }
}
