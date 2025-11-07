import { ScansService } from './scans.service';
import { Users } from '../users/entities/users.entity';
import { IApiResponse } from '../../common/interfaces/api-response.interface';
export declare class ScansController {
    private readonly scansService;
    constructor(scansService: ScansService);
    uploadMriScan(file: Express.Multer.File, user: Users): Promise<IApiResponse>;
    findAll(): Promise<IApiResponse>;
    findOne(id: string): Promise<IApiResponse>;
    findByUser(userId: string): Promise<IApiResponse>;
}
