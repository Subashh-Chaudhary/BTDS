import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Prediction } from './entities/prediction.entity';
import { PredictionResult } from './entities/prediction-result.entity';
import { DiabetesPredictDto } from './dtos/diabetes-predict.dto';

export interface MLModelPrediction {
  prediction: number;
  probability: number;
}

export interface MLServiceResponse {
  predictions: {
    random_forest: MLModelPrediction;
    logistic_regression: MLModelPrediction;
    svm: MLModelPrediction;
  };
  ensemble_prediction: number;
  confidence: number;
}

@Injectable()
export class PredictionsService {
  private readonly logger = new Logger(PredictionsService.name);

  constructor(
    @InjectRepository(Prediction)
    private readonly predictionsRepository: Repository<Prediction>,
    @InjectRepository(PredictionResult)
    private readonly predictionResultsRepository: Repository<PredictionResult>,
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) { }

  private getDiabetesUrl(): string {
    const base = this.config.get<string>('ml.serviceUrl') || 'http://localhost:8000';
    const diabetesPath = this.config.get<string>('ml.diabetesPath') || '/diabetes/predict';
    return `${base.replace(/\/$/, '')}${diabetesPath.startsWith('/') ? '' : '/'}${diabetesPath}`;
  }

  async predictDiabetes(payload: DiabetesPredictDto) {
    this.logger.log(`Processing diabetes prediction for user: ${payload.user_id}`);

    // Step 1: Save incoming request to predictions table
    const predictionRecord = this.predictionsRepository.create({
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

    const savedPrediction = await this.predictionsRepository.save(predictionRecord);
    this.logger.log(`Saved prediction record with ID: ${savedPrediction.id}`);

    try {
      // Step 2: Call ML service
      const mlUrl = this.getDiabetesUrl();
      this.logger.log(`Calling ML service at: ${mlUrl}`);

      const mlPayload = {
        pregnancies: payload.pregnancies,
        glucose: payload.glucose,
        blood_pressure: payload.blood_pressure,
        skin_thickness: payload.skin_thickness,
        insulin: payload.insulin,
        bmi: payload.bmi,
        diabetes_pedigree_function: payload.diabetes_pedigree_function,
        age: payload.age,
      };

      const response = await firstValueFrom(
        this.httpService.post<MLServiceResponse>(mlUrl, mlPayload, {
          timeout: 10000, // 10 second timeout
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );

      const mlData = response.data;
      this.logger.log(`Received ML response: ${JSON.stringify(mlData)}`);

      // Step 3: Save prediction results for each model
      const predictionResults: PredictionResult[] = [];

      for (const [modelName, modelResult] of Object.entries(mlData.predictions)) {
        const result = this.predictionResultsRepository.create({
          prediction_id: savedPrediction.id,
          model_name: modelName,
          prediction_value: modelResult.prediction,
          probability: modelResult.probability,
          ensemble_prediction: mlData.ensemble_prediction,
          ensemble_confidence: mlData.confidence,
        });

        predictionResults.push(result);
      }

      const savedResults = await this.predictionResultsRepository.save(predictionResults);
      this.logger.log(`Saved ${savedResults.length} prediction results`);

      // Step 4: Return complete response
      return {
        prediction: savedPrediction,
        results: savedResults,
        ml_response: {
          ensemble_prediction: mlData.ensemble_prediction,
          confidence: mlData.confidence,
          models: mlData.predictions,
        },
      };
    } catch (error) {
      this.logger.error(`ML service call failed: ${error.message}`, error.stack);

      // If ML service fails, still return the saved prediction
      // This ensures data is not lost even if ML service is down
      throw new HttpException(
        {
          message: 'Failed to get prediction from ML service',
          error: error.message,
          prediction: savedPrediction,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Get prediction by ID with all results
   */
  async getPredictionById(id: string) {
    const prediction = await this.predictionsRepository.findOne({
      where: { id },
    });

    if (!prediction) {
      throw new HttpException('Prediction not found', HttpStatus.NOT_FOUND);
    }

    const results = await this.predictionResultsRepository.find({
      where: { prediction_id: id },
    });

    return {
      prediction,
      results,
    };
  }

  /**
   * Get all predictions for a user
   */
  async getUserPredictions(userId: string) {
    const predictions = await this.predictionsRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });

    return predictions;
  }
}
