import {
  Controller,
  Get,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { ResponseHelper } from '../../common/helpers/response.helper';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Users } from '../users/entities/users.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('reports')
  async list(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Res() res: Response,
    @Query('user_id') user_id?: string,
    @Query('scan_id') scan_id?: string,
    @Query('prediction_id') prediction_id?: string,
  ) {
    const result = await this.reportsService.findAll(page, limit, {
      user_id,
      scan_id,
      prediction_id,
    });
    const response = ResponseHelper.paginated(
      result.items,
      result.page,
      result.limit,
      result.total,
      'Reports retrieved successfully',
      '/reports',
      'GET',
    );
    return res.status(response.statusCode).json(response);
  }

  @Get('reports/user')
  @UseGuards(JwtAuthGuard)
  async myReports(
    @GetUser() user: Users,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Res() res: Response,
  ) {
    const result = await this.reportsService.findAll(page, limit, {
      user_id: user?.id,
    });
    const response = ResponseHelper.paginated(
      result.items,
      result.page,
      result.limit,
      result.total,
      'User reports retrieved successfully',
      '/reports/user',
      'GET',
    );
    return res.status(response.statusCode).json(response);
  }

  @Get('reports/:id')
  async getById(@Param('id') id: string, @Res() res: Response) {
    const item = await this.reportsService.findById(id);
    const response = ResponseHelper.success(
      item,
      'Report retrieved successfully',
      200,
      `/reports/${id}`,
      'GET',
    );
    return res.status(response.statusCode).json(response);
  }
}
