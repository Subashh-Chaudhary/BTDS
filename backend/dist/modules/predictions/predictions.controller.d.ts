import { PredictionsService } from './predictions.service';
import { DiabetesPredictDto } from './dtos/diabetes-predict.dto';
export declare class PredictionsController {
    private readonly predictionsService;
    constructor(predictionsService: PredictionsService);
    predict(payload: DiabetesPredictDto): Promise<{
        success: boolean;
        data: {
            prediction: import("./entities/prediction.entity").Prediction;
            results: import("./entities/prediction-result.entity").PredictionResult[];
            ml_response: {
                ensemble_prediction: number;
                confidence: number;
                models: {
                    random_forest: import("./predictions.service").MLModelPrediction;
                    logistic_regression: import("./predictions.service").MLModelPrediction;
                    svm: import("./predictions.service").MLModelPrediction;
                };
            };
        };
    }>;
    getPrediction(id: string): Promise<{
        success: boolean;
        data: {
            prediction: import("./entities/prediction.entity").Prediction;
            results: import("./entities/prediction-result.entity").PredictionResult[];
        };
    }>;
    getUserPredictions(userId: string): Promise<{
        success: boolean;
        data: {
            results: import("./entities/prediction-result.entity").PredictionResult[];
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
        }[];
    }>;
}
