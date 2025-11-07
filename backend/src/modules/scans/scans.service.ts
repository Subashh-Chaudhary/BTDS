import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudinaryService } from '../../common/services/cloudinary.service';
import { ScansMlService } from './scans-ml.service';
import { Scan } from './entities/scan.entity';

@Injectable()
export class ScansService {
  constructor(
    @InjectRepository(Scan)
    private scansRepository: Repository<Scan>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly scansMlService: ScansMlService,
  ) {}

  async uploadMriScan(userId: string, file: Express.Multer.File) {
    // Upload MRI scan image to Cloudinary
    const imageUrl = await this.cloudinaryService.uploadImageBuffer(file);

    // Create new scan record
    const scan = new Scan();
    scan.user_id = userId;
    scan.image_url = imageUrl;

    // Save scan initially without ML prediction
    const savedScan = await this.scansRepository.save(scan);

    // Get ML prediction
    const prediction = await this.scansMlService.getPrediction(savedScan);

    // Update scan with prediction
    savedScan.model_prediction = prediction;
    savedScan.model_prediction_id = prediction.id;

    // Save scan with prediction
    return this.scansRepository.save(savedScan);
  }

  async findAll() {
    return this.scansRepository.find({
      relations: ['user', 'model_prediction'],
    });
  }

  async findOne(id: string) {
    return this.scansRepository.findOne({
      where: { id },
      relations: ['user', 'model_prediction'],
    });
  }

  async findByUser(userId: string) {
    return this.scansRepository.find({
      where: { user_id: userId },
      relations: ['model_prediction'],
      order: { uploaded_at: 'DESC' },
    });
  }
}
