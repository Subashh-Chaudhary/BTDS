import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Experts } from '../../modules/expert/entities/expert.entity';
import { Users } from '../../modules/users/entities/users.entity';
import { IUserData } from '../interfaces';
export declare class AuthHelper {
    static findUserByVerificationToken(token: string, usersRepository: Repository<Users>, expertsRepository: Repository<Experts>): Promise<{
        id: string;
        user_type: string;
        verification_token: string;
        verification_token_expires_at: Date;
    } | undefined>;
    static findUserByResetToken(token: string, usersRepository: Repository<Users>, expertsRepository: Repository<Experts>): Promise<{
        id: string;
        user_type: string;
        password_reset_token: string;
        reset_token_expires_at: Date;
    } | undefined>;
    static findUserByRefreshToken(token: string, usersRepository: Repository<Users>, expertsRepository: Repository<Experts>): Promise<{
        id: string;
        user_type: string;
        refresh_token: string;
        refresh_token_expires_at: Date;
        email: string;
        name: string;
    } | undefined>;
    static generateToken(user: IUserData, jwtService: JwtService): string;
    static verifyToken(token: string, jwtService: JwtService): any;
    static updateUserVerification(user: {
        id: string;
        user_type: string;
    }, usersRepository: Repository<Users>, expertsRepository: Repository<Experts>): Promise<void>;
    static updateUserResetToken(user: {
        id: string;
        user_type: string;
    }, resetToken: string, expiresAt: Date, usersRepository: Repository<Users>, expertsRepository: Repository<Experts>): Promise<void>;
    static updateUserPassword(user: {
        id: string;
        user_type: string;
    }, hashedPassword: string, usersRepository: Repository<Users>, expertsRepository: Repository<Experts>): Promise<void>;
    static updateExpertLastLogin(expertId: string, expertsRepository: Repository<Experts>): Promise<void>;
}
