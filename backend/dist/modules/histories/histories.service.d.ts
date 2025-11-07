import { Repository } from 'typeorm';
import { Histories } from './entities/history.entity';
import { Users } from '../users/entities/users.entity';
import { Reports } from '../reports/entities/report.entity';
export declare class HistoriesService {
    private readonly repo;
    private readonly usersRepo;
    private readonly reportsRepo;
    constructor(repo: Repository<Histories>, usersRepo: Repository<Users>, reportsRepo: Repository<Reports>);
    recordView(params: {
        user_id: string;
        report_id: string;
        viewed_at?: Date | null;
    }): Promise<Histories>;
    findAll(page?: number, limit?: number, filters?: {
        user_id?: string;
        report_id?: string;
    }): Promise<{
        items: Histories[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<Histories>;
}
