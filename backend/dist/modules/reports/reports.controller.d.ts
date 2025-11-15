import { Response } from 'express';
import { ReportsService } from './reports.service';
import { Users } from '../users/entities/users.entity';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    list(page: number | undefined, limit: number | undefined, res: Response, user_id?: string, scan_id?: string, prediction_id?: string): Promise<Response<any, Record<string, any>>>;
    myReports(user: Users, page: number | undefined, limit: number | undefined, res: Response): Promise<Response<any, Record<string, any>>>;
    getById(id: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
