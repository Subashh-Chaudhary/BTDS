import { Users } from '../../users/entities/users.entity';
import { Scan } from '../../scans/entities/scan.entity';
import { Prediction } from '../../predictions/entities/prediction.entity';
import { Treatment } from '../../treatments/entities/treatment.entity';
export declare class Reports {
    id: string;
    user: Users | null;
    scan: Scan;
    prediction: Prediction;
    treatment: Treatment | null;
    feedback_id: string | null;
    report_url: string | null;
    is_verified: boolean;
    generated_at: Date;
    created_at: Date;
    updated_at: Date;
}
