import { Controller, Post, Get, Body, Param, UsePipes, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { DiabetesPredictDto } from './dtos/diabetes-predict.dto';

@Controller('diabetes')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) { }

  /**
   * Main prediction endpoint
   * POST /diabetes/predict
   */
  @Post('predict')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async predict(@Body() payload: DiabetesPredictDto) {
    const result = await this.predictionsService.predictDiabetes(payload);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get prediction by ID with results
   * GET /diabetes/predictions/:id
   */
  @Get('predictions/:id')
  async getPrediction(@Param('id') id: string) {
    const result = await this.predictionsService.getPredictionById(id);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get all predictions for a user
   * GET /diabetes/users/:userId/predictions
   */
  @Get('users/:userId/predictions')
  async getUserPredictions(@Param('userId') userId: string) {
    const predictions = await this.predictionsService.getUserPredictions(userId);
    return {
      success: true,
      data: predictions,
    };
  }
}
