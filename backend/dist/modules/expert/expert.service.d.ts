import { Repository } from 'typeorm';
import { CreateExpertDto } from './dtos/create-expert.dto';
import { UpdateExpertDto } from './dtos/update-expert.dto';
import { Experts } from './entities/expert.entity';
export declare class ExpertService {
    private expertRepository;
    constructor(expertRepository: Repository<Experts>);
    findById(id: string): Promise<Experts>;
    findByEmail(email: string): Promise<Experts | undefined>;
    findAll(page?: number, limit?: number): Promise<{
        items: Experts[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    updateExpert(id: string, updateData: UpdateExpertDto): Promise<Experts>;
    deleteExpert(id: string): Promise<{
        message: string;
    }>;
    findByProviderId(provider: string, providerId: string): Promise<Experts | undefined>;
    createExpert(expertData: CreateExpertDto): Promise<Experts>;
    findByVerificationToken(token: string): Promise<Experts | undefined>;
    findByPasswordResetToken(token: string): Promise<Experts | undefined>;
    updateLastLogin(id: string): Promise<Experts>;
    updateRefreshToken(id: string, refreshToken: string, expiresAt: Date): Promise<Experts>;
    clearRefreshToken(id: string): Promise<Experts>;
    findActiveExperts(page?: number, limit?: number): Promise<{
        items: Experts[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
}
