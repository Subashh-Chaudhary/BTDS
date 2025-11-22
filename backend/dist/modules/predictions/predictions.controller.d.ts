import { PredictionsService } from './predictions.service';
import { DiabetesPredictDto } from './dtos/diabetes-predict.dto';
export declare class PredictionsController {
    private readonly predictionsService;
    constructor(predictionsService: PredictionsService);
    predict(payload: DiabetesPredictDto): Promise<{
        success: boolean;
        data: import("./entities/prediction.entity").Prediction;
    }>;
}
