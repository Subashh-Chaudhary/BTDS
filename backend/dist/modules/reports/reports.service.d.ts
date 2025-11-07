import { Repository } from 'typeorm';
import { Reports } from './entities/report.entity';
import { Users } from '../users/entities/users.entity';
import { Scan } from '../scans/entities/scan.entity';
import { Prediction } from '../predictions/entities/prediction.entity';
import { Treatment } from '../treatments/entities/treatment.entity';
export declare class ReportsService {
    private readonly repo;
    private readonly usersRepo;
    constructor(repo: Repository<Reports>, usersRepo: Repository<Users>);
    createReport(params: {
        user_id?: string | null;
        scan: Scan;
        prediction: Prediction;
        treatment?: Treatment | null;
        report_url?: string | null;
    }): Promise<Reports>;
    findAll(page?: number, limit?: number, filters?: {
        user_id?: string;
        scan_id?: string;
        prediction_id?: string;
    }): Promise<{
        items: Reports[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<Reports>;
}
