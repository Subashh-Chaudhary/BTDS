import { Response } from 'express';
import { HistoriesService } from './histories.service';
export declare class HistoriesController {
    private readonly historiesService;
    constructor(historiesService: HistoriesService);
    list(page: number | undefined, limit: number | undefined, res: Response, user_id?: string, report_id?: string): Promise<Response<any, Record<string, any>>>;
    create(body: {
        user_id: string;
        report_id: string;
        viewed_at?: string | null;
    }, res: Response): Promise<Response<any, Record<string, any>>>;
    getById(id: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
