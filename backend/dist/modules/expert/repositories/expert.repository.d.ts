import { Repository } from 'typeorm';
import { Experts } from '../entities/expert.entity';
export declare class ExpertRepository {
    private readonly expertRepository;
    constructor(expertRepository: Repository<Experts>);
    findById(id: string): Promise<Experts | undefined>;
    findByEmail(email: string): Promise<Experts | undefined>;
    findByVerificationToken(token: string): Promise<Experts | undefined>;
    findByPasswordResetToken(token: string): Promise<Experts | undefined>;
    findByRefreshToken(token: string): Promise<Experts | undefined>;
    findBySocialProvider(provider: string, providerId: string): Promise<Experts | undefined>;
    create(expertData: Partial<Experts>): Promise<Experts>;
    save(expert: Experts): Promise<Experts>;
    update(id: string, updateData: Partial<Experts>): Promise<any>;
    updateVerificationStatus(id: string, isVerified: boolean, verificationToken?: string, expiresAt?: Date): Promise<any>;
    updatePasswordResetToken(id: string, resetToken: string, expiresAt: Date): Promise<any>;
    updatePassword(id: string, hashedPassword: string): Promise<any>;
    updateLastLogin(id: string): Promise<any>;
    findAllWithPagination(page?: number, limit?: number): Promise<[Experts[], number]>;
    findAllActive(): Promise<Experts[]>;
    findAllVerified(): Promise<Experts[]>;
    delete(id: string): Promise<any>;
    softDelete(id: string): Promise<any>;
}
