import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { TreatmentsService } from './treatments.service';
import { Treatment } from './entities/treatment.entity';

@Controller('treatments')
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  @Post()
  async create(@Body() data: Partial<Treatment>) {
    return this.treatmentsService.create(data);
  }

  @Get()
  async findAll() {
    return this.treatmentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.treatmentsService.findOne(id);
  }

  @Get('prediction/:predictionId')
  async findByPrediction(@Param('predictionId') predictionId: string) {
    return this.treatmentsService.findByPrediction(predictionId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<Treatment>) {
    return this.treatmentsService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.treatmentsService.remove(id);
  }
}
