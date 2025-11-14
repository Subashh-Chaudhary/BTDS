import { Scan } from '../../scans/entities/scan.entity';
import { Experts } from '../../expert/entities/expert.entity';
import { Reports } from '../../reports/entities/report.entity';
export declare class Feedback {
    id: string;
    scan: Scan;
    scan_id: string;
    expert: Experts;
    expert_id: string;
    report?: Reports | null;
    report_id?: string | null;
    feedback_text: string;
    verified_at: Date;
}
