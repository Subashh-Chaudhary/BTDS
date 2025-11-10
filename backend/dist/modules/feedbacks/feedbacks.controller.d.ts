import { Response } from 'express';
import { Experts } from '../expert/entities/expert.entity';
import { FeedbacksService } from './feedbacks.service';
export declare class FeedbacksController {
    private readonly feedbacksService;
    constructor(feedbacksService: FeedbacksService);
    addFeedback(scanId: string, body: {
        feedback_text: string;
    }, user: Experts, res: Response): Promise<Response<any, Record<string, any>>>;
    getByScan(scanId: string, res: Response): Promise<Response<any, Record<string, any>>>;
    updateFeedback(id: string, body: {
        feedback_text: string;
    }, user: Experts, res: Response): Promise<Response<any, Record<string, any>>>;
    removeFeedback(id: string, user: Experts, res: Response): Promise<Response<any, Record<string, any>>>;
}
