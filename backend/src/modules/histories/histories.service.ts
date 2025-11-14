import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Histories } from './entities/history.entity';
import { Users } from '../users/entities/users.entity';
import { Reports } from '../reports/entities/report.entity';

@Injectable()
export class HistoriesService {
  constructor(
    @InjectRepository(Histories) private readonly repo: Repository<Histories>,
    @InjectRepository(Users) private readonly usersRepo: Repository<Users>,
    @InjectRepository(Reports)
    private readonly reportsRepo: Repository<Reports>,
  ) {}

  async recordView(params: {
    user_id: string;
    report_id: string;
    viewed_at?: Date | null;
  }): Promise<Histories> {
    const user = await this.usersRepo.findOne({
      where: { id: params.user_id },
    });
    if (!user) throw new NotFoundException('User not found');

    const report = await this.reportsRepo.findOne({
      where: { id: params.report_id },
    });
    if (!report) throw new NotFoundException('Report not found');

    const entity = this.repo.create({
      user,
      report,
      viewed_at: params.viewed_at ?? new Date(),
    });
    return this.repo.save(entity);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: { user_id?: string; report_id?: string },
  ): Promise<{
    items: Histories[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters?.user_id) where.user = { id: filters.user_id };
    if (filters?.report_id) where.report = { id: filters.report_id };

    const [items, total] = await this.repo.findAndCount({
      where,
      relations: ['user', 'report', 'report.user', 'report.scan', 'report.prediction', 'report.treatment'],
      order: { viewed_at: 'DESC' },
      skip,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async findById(id: string): Promise<Histories> {
    const item = await this.repo.findOne({
      where: { id },
      relations: ['user', 'report', 'report.user', 'report.scan', 'report.prediction', 'report.treatment'],
    });
    if (!item) throw new NotFoundException('History not found');
    return item;
  }
}
