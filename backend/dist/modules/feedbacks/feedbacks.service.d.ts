import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { Scan } from '../scans/entities/scan.entity';
import { Experts } from '../expert/entities/expert.entity';
export declare class FeedbacksService {
    private readonly feedbackRepo;
    private readonly scansRepo;
    private readonly expertsRepo;
    constructor(feedbackRepo: Repository<Feedback>, scansRepo: Repository<Scan>, expertsRepo: Repository<Experts>);
    createFeedback(expertId: string, scanId: string, data: {
        feedback_text: string;
    }): Promise<Feedback>;
    findByScan(scanId: string): Promise<Feedback[]>;
    findOne(id: string): Promise<Feedback>;
    updateFeedback(id: string, expertId: string, data: Partial<Feedback>): Promise<Feedback>;
    removeFeedback(id: string, expertId: string): Promise<{
        id: string;
    }>;
}
