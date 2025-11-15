import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ResponseHelper } from '../../common/helpers/response.helper';
import { HistoriesService } from './histories.service';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Users } from '../users/entities/users.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('')
export class HistoriesController {
  constructor(private readonly historiesService: HistoriesService) {}

  @Get('histories')
  async list(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Res() res: Response,
    @Query('user_id') user_id?: string,
    @Query('report_id') report_id?: string,
  ) {
    const result = await this.historiesService.findAll(page, limit, {
      user_id,
      report_id,
    });
    const response = ResponseHelper.paginated(
      result.items,
      result.page,
      result.limit,
      result.total,
      'Histories retrieved successfully',
      '/histories',
      'GET',
    );
    return res.status(response.statusCode).json(response);
  }

  @Get('histories/user')
  @UseGuards(JwtAuthGuard)
  async myHistories(
    @GetUser() user: Users,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Res() res: Response,
  ) {
    const result = await this.historiesService.findAll(page, limit, {
      user_id: user?.id,
    });
    const response = ResponseHelper.paginated(
      result.items,
      result.page,
      result.limit,
      result.total,
      'User histories retrieved successfully',
      '/histories/user',
      'GET',
    );
    return res.status(response.statusCode).json(response);
  }

  @Post('histories')
  async create(
    @Body()
    body: { user_id: string; report_id: string; viewed_at?: string | null },
    @Res() res: Response,
  ) {
    const viewedAt = body.viewed_at ? new Date(body.viewed_at) : undefined;
    const item = await this.historiesService.recordView({
      user_id: body.user_id,
      report_id: body.report_id,
      viewed_at: viewedAt,
    });
    const response = ResponseHelper.created(
      item,
      'History created successfully',
      '/histories',
      'POST',
    );
    return res.status(response.statusCode).json(response);
  }

  @Get('histories/:id')
  async getById(@Param('id') id: string, @Res() res: Response) {
    const item = await this.historiesService.findById(id);
    const response = ResponseHelper.success(
      item,
      'History retrieved successfully',
      200,
      `/histories/${id}`,
      'GET',
    );
    return res.status(response.statusCode).json(response);
  }
}
