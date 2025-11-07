import { Repository } from 'typeorm';
import { CreateSocialUserDto } from '../dtos/create-user.dto';
import { Users } from '../entities/users.entity';
export declare class UsersRepository {
    private readonly userRepository;
    constructor(userRepository: Repository<Users>);
    findByEmail(email: string): Promise<Users | undefined>;
    findById(id: string): Promise<Users | undefined>;
    findByVerificationToken(token: string): Promise<Users | undefined>;
    findByPasswordResetToken(token: string): Promise<Users | undefined>;
    findByRefreshToken(token: string): Promise<Users | undefined>;
    findBySocialProvider(provider: string, providerId: string): Promise<Users | undefined>;
    create(userData: Partial<Users>): Promise<Users>;
    save(user: Users): Promise<Users>;
    update(id: string, updateData: Partial<Users>): Promise<any>;
    updateVerificationStatus(id: string, isVerified: boolean, verificationToken?: string, expiresAt?: Date): Promise<any>;
    updatePasswordResetToken(id: string, resetToken: string, expiresAt: Date): Promise<any>;
    updatePassword(id: string, hashedPassword: string): Promise<any>;
    updateLastLogin(id: string): Promise<any>;
    findAllWithPagination(page?: number, limit?: number): Promise<[Users[], number]>;
    findAllActive(): Promise<Users[]>;
    findAllVerified(): Promise<Users[]>;
    delete(id: string): Promise<any>;
    softDelete(id: string): Promise<any>;
    findBySocialId(provider: string, socialId: string): Promise<Users | undefined>;
    createSocialUser(profile: CreateSocialUserDto): Promise<Users>;
}
