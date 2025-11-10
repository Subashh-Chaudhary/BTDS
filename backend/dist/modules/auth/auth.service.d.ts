import { JwtService } from '@nestjs/jwt';
import { IUserData } from 'src/common/interfaces';
import { TokenManagerService } from 'src/common/services/token-manager.service';
import { Repository } from 'typeorm';
import { Experts } from '../expert/entities/expert.entity';
import { ExpertService } from '../expert/expert.service';
import { ExpertRepository } from '../expert/repositories';
import { Users } from '../users/entities/users.entity';
import { UsersRepository } from '../users/repositories/users.repository';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
export declare class AuthService {
    private jwtService;
    private usersService;
    private expertService;
    private tokenManager;
    private usersRepository;
    private expertsRepository;
    private usersRepo;
    private expertRepo;
    constructor(jwtService: JwtService, usersService: UsersService, expertService: ExpertService, tokenManager: TokenManagerService, usersRepository: Repository<Users>, expertsRepository: Repository<Experts>, usersRepo: UsersRepository, expertRepo: ExpertRepository);
    register(registerDto: RegisterDto): Promise<{
        user: Record<string, unknown>;
        access_token: string;
    }>;
    private createUser;
    private createExpert;
    login(loginDto: LoginDto): Promise<{
        user: Record<string, unknown>;
        access_token: string;
        user_type: 'user' | 'expert';
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    requestPasswordReset(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    refreshToken(refreshToken: string): Promise<{
        access_token: string;
    }>;
    private findUserByEmail;
    generateToken(user: IUserData): string;
    getFullUserById(id: string): Promise<Record<string, unknown>>;
    verifyToken(token: string): any;
    private verifyPassword;
}
