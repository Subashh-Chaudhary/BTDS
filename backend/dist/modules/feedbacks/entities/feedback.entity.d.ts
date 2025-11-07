import { Scan } from '../../scans/entities/scan.entity';
import { Experts } from '../../expert/entities/expert.entity';
export declare class Feedback {
    id: string;
    scan: Scan;
    scan_id: string;
    expert: Experts;
    expert_id: string;
    feedback_text: string;
    verified_at: Date;
}
