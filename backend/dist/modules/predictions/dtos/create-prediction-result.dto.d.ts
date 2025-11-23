export declare class CreatePredictionResultDto {
    prediction_id: string;
    model_name: string;
    prediction_value: number;
    probability: number;
    ensemble_prediction?: number;
    ensemble_confidence?: number;
}
