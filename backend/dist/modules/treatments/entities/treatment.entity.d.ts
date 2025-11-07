import { Prediction } from '../../predictions/entities/prediction.entity';
export declare class Treatment {
    id: string;
    prediction: Prediction;
    prediction_id: string;
    description: string;
    medication: string;
    therapy_type: string;
    created_at: Date;
    updated_at: Date;
}
