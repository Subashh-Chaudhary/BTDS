import {
  Controller,
  Get,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { ResponseHelper } from '../../common/helpers/response.helper';

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
