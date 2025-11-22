import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";
import { Experts } from "../../modules/expert/entities/expert.entity";
import { Users } from "../../modules/users/entities/users.entity";
import { IUserData } from "../interfaces";
export declare class AuthHelper {
    static findUserByVerificationToken(token: string, usersRepository: Repository<Users>, expertsRepository: Repository<Experts>): Promise<{
        id: string;
        isExpert: boolean;
        verification_token: string;
        verification_token_expires_at: Date;
    } | undefined>;
    static findUserByResetToken(token: string, usersRepository: Repository<Users>, expertsRepository: Repository<Experts>): Promise<{
        id: string;
        isExpert: boolean;
        password_reset_token: string;
        reset_token_expires_at: Date;
    } | undefined>;
    static findUserByRefreshToken(token: string, usersRepository: Repository<Users>, expertsRepository: Repository<Experts>): Promise<{
        id: string;
        isExpert: boolean;
        refresh_token: string;
        refresh_token_expires_at: Date;
        email: string;
        name: string;
    } | undefined>;
    static generateToken(user: IUserData, jwtService: JwtService): string;
    static verifyToken(token: string, jwtService: JwtService): any;
    static updateUserVerification(user: {
        id: string;
        isExpert: boolean;
    }, usersRepository: Repository<Users>, expertsRepository: Repository<Experts>): Promise<void>;
    static updateUserResetToken(user: {
        id: string;
        isExpert: boolean;
    }, resetToken: string, expiresAt: Date, usersRepository: Repository<Users>, expertsRepository: Repository<Experts>): Promise<void>;
    static updateUserPassword(user: {
        id: string;
        isExpert: boolean;
    }, hashedPassword: string, usersRepository: Repository<Users>, expertsRepository: Repository<Experts>): Promise<void>;
    static updateExpertLastLogin(expertId: string, expertsRepository: Repository<Experts>): Promise<void>;
}
