import { Injectable, HttpException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prediction } from './entities/prediction.entity';
import { DiabetesPredictDto } from './dtos/diabetes-predict.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PredictionsService {
  private readonly logger = new Logger(PredictionsService.name);

  constructor(
    @InjectRepository(Prediction)
    private readonly predictionsRepository: Repository<Prediction>,
    private readonly config: ConfigService,
  ) {}

  private getDiabetesUrl() {
    const base = this.config.get<string>('ml.serviceUrl') || 'http://localhost:8000';
    // allow override specifically for diabetes endpoint
    const diabetesPath = this.config.get<string>('ml.diabetesPath') || '/diabetes/predict';
    return `${base.replace(/\/$/, '')}${diabetesPath.startsWith('/') ? '' : '/'}${diabetesPath}`;
  }

  async predictDiabetes(payload: DiabetesPredictDto) {
    // save incoming request first (persist diabetes-specific columns)
    const record = this.predictionsRepository.create({
      user_id: payload.user_id || null,
      pregnancies: payload.pregnancies,
      glucose: payload.glucose,
      blood_pressure: payload.blood_pressure,
      skin_thickness: payload.skin_thickness,
      insulin: payload.insulin,
      bmi: payload.bmi,
      diabetes_pedigree_function: payload.diabetes_pedigree_function,
      age: payload.age,
    });

    const saved = await this.predictionsRepository.save(record);
    // Per requirement: do not call ML service initially — just return the saved DB record.
    return saved;
  }
}
