import { Repository } from 'typeorm';
import { Prediction } from './entities/prediction.entity';
import { DiabetesPredictDto } from './dtos/diabetes-predict.dto';
import { ConfigService } from '@nestjs/config';
export declare class PredictionsService {
    private readonly predictionsRepository;
    private readonly config;
    private readonly logger;
    constructor(predictionsRepository: Repository<Prediction>, config: ConfigService);
    private getDiabetesUrl;
    predictDiabetes(payload: DiabetesPredictDto): Promise<Prediction>;
}
