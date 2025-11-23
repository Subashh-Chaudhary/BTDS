import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { PredictionsController } from './predictions.controller';
import { PredictionsService } from './predictions.service';
import { Prediction } from './entities/prediction.entity';
import { PredictionResult } from './entities/prediction-result.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Prediction, PredictionResult]),
    HttpModule,
  ],
  controllers: [PredictionsController],
  providers: [PredictionsService],
  exports: [PredictionsService],
})
export class PredictionsModule { }
