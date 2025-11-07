import { Repository } from 'typeorm';
import { Treatment } from './entities/treatment.entity';
export declare class TreatmentsService {
    private treatmentsRepository;
    constructor(treatmentsRepository: Repository<Treatment>);
    create(data: Partial<Treatment>): Promise<Treatment>;
    findAll(): Promise<Treatment[]>;
    findOne(id: string): Promise<Treatment | null>;
    findByPrediction(predictionId: string): Promise<Treatment[]>;
    update(id: string, data: Partial<Treatment>): Promise<Treatment | null>;
    remove(id: string): Promise<{
        id: string;
    }>;
}
