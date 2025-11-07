import { Users } from '../../users/entities/users.entity';
import { Reports } from '../../reports/entities/report.entity';
export declare class Histories {
    id: string;
    user: Users;
    report: Reports;
    viewed_at: Date | null;
    created_at: Date;
    updated_at: Date;
}
