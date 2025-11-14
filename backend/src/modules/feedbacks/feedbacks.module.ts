import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from './entities/feedback.entity';
import { Scan } from '../scans/entities/scan.entity';
import { Experts } from '../expert/entities/expert.entity';
import { Reports } from '../reports/entities/report.entity';
import { FeedbacksService } from './feedbacks.service';
import { FeedbacksController } from './feedbacks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback, Scan, Experts, Reports])],
  providers: [FeedbacksService],
  controllers: [FeedbacksController],
  exports: [FeedbacksService],
})
export class FeedbacksModule {}
