import { Response } from 'express';
import { Experts } from '../expert/entities/expert.entity';
import { FeedbacksService } from './feedbacks.service';
import { CreateFeedbackDto } from './dtos/create-feedback.dto';
export declare class FeedbacksController {
    private readonly feedbacksService;
    constructor(feedbacksService: FeedbacksService);
    addFeedback(scanId: string, body: CreateFeedbackDto, user: Experts, res: Response): Promise<Response<any, Record<string, any>>>;
    addReportFeedback(reportId: string, body: CreateFeedbackDto, user: Experts, res: Response): Promise<Response<any, Record<string, any>>>;
    getByScan(scanId: string, res: Response): Promise<Response<any, Record<string, any>>>;
    getByReport(reportId: string, res: Response): Promise<Response<any, Record<string, any>>>;
    updateFeedback(id: string, body: Partial<CreateFeedbackDto>, user: Experts, res: Response): Promise<Response<any, Record<string, any>>>;
    removeFeedback(id: string, user: Experts, res: Response): Promise<Response<any, Record<string, any>>>;
}
