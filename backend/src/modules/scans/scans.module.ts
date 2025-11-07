import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { CloudinaryService } from '../../common/services/cloudinary.service';
import { MlClientService } from '../../common/services/ml-client.service';
import { Users } from '../users/entities/users.entity';
import { Prediction } from '../predictions/entities/prediction.entity';
import { Treatment } from '../treatments/entities/treatment.entity';
import { Feedback } from '../feedbacks/entities/feedback.entity';
import { ReportsModule } from '../reports/reports.module';
import { HistoriesModule } from '../histories/histories.module';
import { ScansController } from './scans.controller';
import { ScansService } from './scans.service';
import { Scan } from './entities/scan.entity';
import { ScansMlService } from './scans-ml.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Scan, Users, Prediction, Treatment, Feedback]),
    ReportsModule,
    HistoriesModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [ScansController],
  providers: [ScansService, CloudinaryService, MlClientService, ScansMlService],
  exports: [ScansService, CloudinaryService, MlClientService, ScansMlService],
})
export class ScansModule {}
