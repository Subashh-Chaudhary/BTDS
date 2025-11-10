import {
  Controller,
  Post,
  UseGuards,
  Param,
  Body,
  Res,
  HttpStatus,
  Put,
  Delete,
  Get,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Experts } from '../expert/entities/expert.entity';
import { FeedbacksService } from './feedbacks.service';
import { ResponseHelper } from 'src/common/helpers/response.helper';

@Controller('feedbacks')
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @Post(':scanId')
  @UseGuards(JwtAuthGuard)
  async addFeedback(
    @Param('scanId') scanId: string,
    @Body() body: { feedback_text: string },
    @GetUser() user: Experts,
    @Res() res: Response,
  ) {
    const expert = user as Experts;
    const feedback = await this.feedbacksService.createFeedback(
      expert.id,
      scanId,
      body,
    );
    const response = ResponseHelper.created(
      feedback,
      'Feedback created successfully',
      `/feedbacks/${scanId}`,
      'POST',
    );
    return res.status(response.statusCode).json(response);
  }

  @Get('scan/:scanId')
  async getByScan(@Param('scanId') scanId: string, @Res() res: Response) {
    const items = await this.feedbacksService.findByScan(scanId);
    const response = ResponseHelper.success(
      items,
      'Feedbacks retrieved successfully',
      HttpStatus.OK,
      `/feedbacks/scan/${scanId}`,
      'GET',
    );
    return res.status(response.statusCode).json(response);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateFeedback(
    @Param('id') id: string,
    @Body() body: { feedback_text: string },
    @GetUser() user: Experts,
    @Res() res: Response,
  ) {
    const updated = await this.feedbacksService.updateFeedback(id, user.id, body as any);
    const response = ResponseHelper.success(
      updated,
      'Feedback updated successfully',
      HttpStatus.OK,
      `/feedbacks/${id}`,
      'PUT',
    );
    return res.status(response.statusCode).json(response);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async removeFeedback(@Param('id') id: string, @GetUser() user: Experts, @Res() res: Response) {
    const result = await this.feedbacksService.removeFeedback(id, user.id);
    const response = ResponseHelper.success(
      result,
      'Feedback removed successfully',
      HttpStatus.OK,
      `/feedbacks/${id}`,
      'DELETE',
    );
    return res.status(response.statusCode).json(response);
  }
}
