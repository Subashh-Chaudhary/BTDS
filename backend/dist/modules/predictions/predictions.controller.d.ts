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
        data: import("./entities/prediction.entity").Prediction[];
    }>;
}
