import { ConfigService } from '@nestjs/config';
import { UploadApiOptions } from 'cloudinary';
export declare class CloudinaryService {
    private readonly config;
    constructor(config: ConfigService);
    uploadImageBuffer(file: any, options?: UploadApiOptions & {
        folder?: string;
    }): Promise<string>;
}
