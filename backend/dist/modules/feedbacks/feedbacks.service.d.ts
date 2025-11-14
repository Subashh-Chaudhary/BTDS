import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { Scan } from '../scans/entities/scan.entity';
import { Experts } from '../expert/entities/expert.entity';
import { Reports } from '../reports/entities/report.entity';
export declare class FeedbacksService {
    private readonly feedbackRepo;
    private readonly scansRepo;
    private readonly expertsRepo;
    private readonly reportsRepo;
    constructor(feedbackRepo: Repository<Feedback>, scansRepo: Repository<Scan>, expertsRepo: Repository<Experts>, reportsRepo: Repository<Reports>);
    createFeedback(expertId: string, scanId: string, data: {
        feedback_text: string;
    }): Promise<Feedback>;
    createFeedbackForReport(expertIdentifier: string | number | Record<string, any>, reportId: string, data: {
        feedback_text: string;
    }): Promise<Feedback>;
    findByScan(scanId: string): Promise<Feedback[]>;
    findByReport(reportId: string): Promise<Feedback[]>;
    findOne(id: string): Promise<Feedback>;
    updateFeedback(id: string, expertId: string, data: Partial<Feedback>): Promise<Feedback>;
    removeFeedback(id: string, expertId: string): Promise<{
        id: string;
    }>;
}
