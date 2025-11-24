import { Response } from 'express';
import { ReportsService } from './reports.service';
import { Users } from '../users/entities/users.entity';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    list(page: number | undefined, limit: number | undefined, res: Response, user_id?: string, scan_id?: string, prediction_id?: string): Promise<Response<any, Record<string, any>>>;
    myReports(user: Users, page: number | undefined, limit: number | undefined, res: Response): Promise<Response<any, Record<string, any>>>;
    getById(id: string, res: Response): Promise<Response<any, Record<string, any>>>;
    update(id: string, body: Partial<{
        treatment_id?: string | null;
        feedback_id?: string | null;
        report_url?: string | null;
        is_verified?: boolean | null;
    }>, res: Response): Promise<Response<any, Record<string, any>>>;
    remove(id: string, user: Users, res: Response): Promise<Response<any, Record<string, any>>>;
}
