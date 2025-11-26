import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Prediction } from './entities/prediction.entity';
import { PredictionResult } from './entities/prediction-result.entity';
import { DiabetesPredictDto } from './dtos/diabetes-predict.dto';
export interface MLModelPrediction {
    prediction: number;
    probability: number;
}
export interface MLServiceResponse {
    predictions: {
        random_forest: MLModelPrediction;
        logistic_regression: MLModelPrediction;
        svm: MLModelPrediction;
    };
    ensemble_prediction: number;
    confidence: number;
}
export declare class PredictionsService {
    private readonly predictionsRepository;
    private readonly predictionResultsRepository;
    private readonly httpService;
    private readonly config;
    private readonly logger;
    constructor(predictionsRepository: Repository<Prediction>, predictionResultsRepository: Repository<PredictionResult>, httpService: HttpService, config: ConfigService);
    private getDiabetesUrl;
    predictDiabetes(payload: DiabetesPredictDto): Promise<{
        prediction: Prediction;
        results: PredictionResult[];
        ml_response: {
            ensemble_prediction: number;
            confidence: number;
            models: {
                random_forest: MLModelPrediction;
                logistic_regression: MLModelPrediction;
                svm: MLModelPrediction;
            };
        };
    }>;
    getPredictionById(id: string): Promise<{
        prediction: Prediction;
        results: PredictionResult[];
    }>;
    getUserPredictions(userId: string): Promise<{
        results: PredictionResult[];
        ml_response: {
            ensemble_prediction: number | null;
            confidence: number | null;
            models: Record<string, {
                prediction: number;
                probability: number;
            }>;
        };
        id: string;
        user_id: string | null;
        pregnancies: number | null;
        glucose: number | null;
        blood_pressure: number | null;
        skin_thickness: number | null;
        insulin: number | null;
        bmi: number | null;
        diabetes_pedigree_function: number | null;
        age: number | null;
        created_at: Date;
        updated_at: Date;
    }[]>;
}
