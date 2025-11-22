import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { DiabetesPredictDto } from './dtos/diabetes-predict.dto';

@Controller('diabetes')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Post('predict')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async predict(@Body() payload: DiabetesPredictDto) {
    const result = await this.predictionsService.predictDiabetes(payload);
    return { success: true, data: result };
  }
}
