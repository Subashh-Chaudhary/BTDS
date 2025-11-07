import { Repository } from 'typeorm';
import { MlClientService } from '../../common/services/ml-client.service';
import { CloudinaryService } from '../../common/services/cloudinary.service';
import { Scan } from './entities/scan.entity';
import { Prediction } from '../predictions/entities/prediction.entity';
export declare class ScansMlService {
    private predictionsRepository;
    private readonly mlClientService;
    private readonly cloudinaryService;
    constructor(predictionsRepository: Repository<Prediction>, mlClientService: MlClientService, cloudinaryService: CloudinaryService);
    getPrediction(scan: Scan): Promise<Prediction>;
}
