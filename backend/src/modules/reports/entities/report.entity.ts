import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from '../../users/entities/users.entity';
import { Scan } from '../../scans/entities/scan.entity';
import { Prediction } from '../../predictions/entities/prediction.entity';
import { Treatment } from '../../treatments/entities/treatment.entity';

@Entity('reports')
@Index(['user'])
@Index(['scan'])
@Index(['prediction'])
@Index(['treatment'])
export class Reports {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Users, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: Users | null;

  @ManyToOne(() => Scan, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scan_id' })
  scan: Scan;

  @ManyToOne(() => Prediction, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'prediction_id' })
  prediction: Prediction;

  @ManyToOne(() => Treatment, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'treatment_id' })
  treatment: Treatment | null;

  @Column('uuid', { nullable: true })
  feedback_id: string | null;

  @Column({ type: 'text', nullable: true })
  report_url: string | null;

  @Column({ type: 'timestamp with time zone', default: () => 'now()' })
  generated_at: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
