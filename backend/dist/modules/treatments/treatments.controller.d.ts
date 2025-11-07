import { TreatmentsService } from './treatments.service';
import { Treatment } from './entities/treatment.entity';
export declare class TreatmentsController {
    private readonly treatmentsService;
    constructor(treatmentsService: TreatmentsService);
    create(data: Partial<Treatment>): Promise<Treatment>;
    findAll(): Promise<Treatment[]>;
    findOne(id: string): Promise<Treatment | null>;
    findByPrediction(predictionId: string): Promise<Treatment[]>;
    update(id: string, data: Partial<Treatment>): Promise<Treatment | null>;
    remove(id: string): Promise<{
        id: string;
    }>;
}
