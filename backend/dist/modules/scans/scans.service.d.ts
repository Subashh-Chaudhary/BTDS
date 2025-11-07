import { Repository } from 'typeorm';
import { CloudinaryService } from '../../common/services/cloudinary.service';
import { ScansMlService } from './scans-ml.service';
import { Scan } from './entities/scan.entity';
export declare class ScansService {
    private scansRepository;
    private readonly cloudinaryService;
    private readonly scansMlService;
    constructor(scansRepository: Repository<Scan>, cloudinaryService: CloudinaryService, scansMlService: ScansMlService);
    uploadMriScan(userId: string, file: Express.Multer.File): Promise<Scan>;
    findAll(): Promise<Scan[]>;
    findOne(id: string): Promise<Scan | null>;
    findByUser(userId: string): Promise<Scan[]>;
}
