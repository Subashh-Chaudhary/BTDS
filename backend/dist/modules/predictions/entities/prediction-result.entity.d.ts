import { Prediction } from './prediction.entity';
export declare class PredictionResult {
    id: string;
    prediction_id: string;
    prediction: Prediction;
    model_name: string;
    prediction_value: number;
    probability: number;
    ensemble_prediction: number | null;
    ensemble_confidence: number | null;
    created_at: Date;
    updated_at: Date;
}
