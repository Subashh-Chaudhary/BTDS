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
  ParseUUIDPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Experts } from '../expert/entities/expert.entity';
import { FeedbacksService } from './feedbacks.service';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { CreateFeedbackDto } from './dtos/create-feedback.dto';

@Controller('feedbacks')
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @Post('scan/:scanId')
  @UseGuards(JwtAuthGuard)
  async addFeedback(
    @Param('scanId', new ParseUUIDPipe()) scanId: string,
    @Body() body: CreateFeedbackDto,
    @GetUser() user: Experts,
    @Res() res: Response,
  ) {
    const expert = user as Experts;
    const feedback = await this.feedbacksService.createFeedback(expert.id, scanId, body);
    const response = ResponseHelper.created(
      feedback,
      'Feedback created successfully',
      `/feedbacks/scan/${scanId}`,
      'POST',
    );
    return res.status(response.statusCode).json(response);
  }

  @Post('report/:reportId')
  @UseGuards(JwtAuthGuard)
  async addReportFeedback(
    @Param('reportId', new ParseUUIDPipe()) reportId: string,
    @Body() body: CreateFeedbackDto,
    @GetUser() user: Experts,
    @Res() res: Response,
  ) {
    const expertPayload = user;
    // debug: log incoming user shape to help diagnose legacy numeric IDs
    // eslint-disable-next-line no-console
    console.log('[DEBUG] FeedbacksController.addReportFeedback - user:', typeof user, user);
    const feedback = await this.feedbacksService.createFeedbackForReport(expertPayload, reportId, body);
    const response = ResponseHelper.created(
      feedback,
      'Report feedback created successfully',
      `/feedbacks/report/${reportId}`,
      'POST',
    );
    return res.status(response.statusCode).json(response);
  }

  @Get('scan/:scanId')
  async getByScan(@Param('scanId', new ParseUUIDPipe()) scanId: string, @Res() res: Response) {
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

  @Get('report/:reportId')
  async getByReport(
    @Param('reportId', new ParseUUIDPipe()) reportId: string,
    @Res() res: Response,
  ) {
    const items = await this.feedbacksService.findByReport(reportId);
    const response = ResponseHelper.success(
      items,
      'Report feedbacks retrieved successfully',
      HttpStatus.OK,
      `/feedbacks/report/${reportId}`,
      'GET',
    );
    return res.status(response.statusCode).json(response);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateFeedback(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: Partial<CreateFeedbackDto>,
    @GetUser() user: Experts,
    @Res() res: Response,
  ) {
    const updated = await this.feedbacksService.updateFeedback(id, user.id, body);
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
  async removeFeedback(
    @Param('id', new ParseUUIDPipe()) id: string,
    @GetUser() user: Experts,
    @Res() res: Response,
  ) {
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
