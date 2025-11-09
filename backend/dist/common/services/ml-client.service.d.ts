import { ConfigService } from '@nestjs/config';
export interface Detection {
    class: string;
    confidence: number;
    bbox: number[];
}
export interface MlPredictionResult {
    totalDetections: number;
    detections: Detection[];
    outputImage: string | string[];
}
export declare class MlClientService {
    private readonly config;
    private readonly baseUrl;
    private readonly predictPath;
    constructor(config: ConfigService);
    predict(file: Express.Multer.File): Promise<MlPredictionResult & {
        outputBuffer?: Buffer | Buffer[];
        requestId?: string;
    }>;
}
