import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Histories } from './entities/history.entity';
import { Users } from '../users/entities/users.entity';
import { Reports } from '../reports/entities/report.entity';
import { HistoriesService } from './histories.service';
import { HistoriesController } from './histories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Histories, Users, Reports])],
  controllers: [HistoriesController],
  providers: [HistoriesService],
  exports: [HistoriesService, TypeOrmModule],
})
export class HistoriesModule {}
