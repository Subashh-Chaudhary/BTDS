import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Treatment } from './entities/treatment.entity';

@Injectable()
export class TreatmentsService {
  constructor(
    @InjectRepository(Treatment)
    private treatmentsRepository: Repository<Treatment>,
  ) {}

  async create(data: Partial<Treatment>) {
    const treatment = this.treatmentsRepository.create(data);
    return this.treatmentsRepository.save(treatment);
  }

  async findAll() {
    return this.treatmentsRepository.find({
      relations: ['prediction'],
    });
  }

  async findOne(id: string) {
    return this.treatmentsRepository.findOne({
      where: { id },
      relations: ['prediction'],
    });
  }

  async findByPrediction(predictionId: string) {
    return this.treatmentsRepository.find({
      where: { prediction_id: predictionId },
    });
  }

  async update(id: string, data: Partial<Treatment>) {
    await this.treatmentsRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    const treatment = await this.findOne(id);
    if (treatment) {
      await this.treatmentsRepository.remove(treatment);
    }
    return { id };
  }
}
