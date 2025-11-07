import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Reports } from './entities/report.entity';
import { Users } from '../users/entities/users.entity';
import { Scan } from '../scans/entities/scan.entity';
import { Prediction } from '../predictions/entities/prediction.entity';
import { Treatment } from '../treatments/entities/treatment.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Reports) private readonly repo: Repository<Reports>,
    @InjectRepository(Users) private readonly usersRepo: Repository<Users>,
  ) {}

  async createReport(params: {
    user_id?: string | null;
    scan: Scan;
    prediction: Prediction;
    treatment?: Treatment | null;
    report_url?: string | null;
  }): Promise<Reports> {
    const { user_id, scan, prediction, treatment, report_url } = params;
    let user: Users | null = null;
    if (user_id) {
      user = await this.usersRepo.findOne({ where: { id: user_id } });
    }
    const entity = this.repo.create({
      user: user ?? null,
      scan,
      prediction,
      treatment: treatment ?? null,
      feedback_id: null,
      report_url: report_url ?? null,
      generated_at: new Date(),
    });
    return this.repo.save(entity);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: { user_id?: string; scan_id?: string; prediction_id?: string },
  ): Promise<{ items: Reports[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<Reports> = {} as FindOptionsWhere<Reports>;
    if (filters?.user_id) where.user = { id: filters.user_id };
    if (filters?.scan_id) where.scan = { id: filters.scan_id };
    if (filters?.prediction_id)
      where.prediction = { id: filters.prediction_id };
    const [items, total] = await this.repo.findAndCount({
      where,
      relations: ['user', 'scan', 'prediction', 'treatment'],
      order: { generated_at: 'DESC' },
      skip,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async findById(id: string): Promise<Reports> {
    const report = await this.repo.findOne({
      where: { id },
      relations: ['user', 'scan', 'prediction', 'treatment'],
    });
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }
}
