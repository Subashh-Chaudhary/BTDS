import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { Scan } from '../../scans/entities/scan.entity';
import { Experts } from '../../expert/entities/expert.entity';
import { Reports } from '../../reports/entities/report.entity';

@Entity('feedbacks')
@Index(['scan_id'])
@Index(['report_id'])
@Index(['expert_id'])
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Scan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scan_id' })
  scan: Scan;

  @Column()
  scan_id: string;

  @ManyToOne(() => Experts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expert_id' })
  expert: Experts;

  @Column()
  expert_id: string;

  @ManyToOne(() => Reports, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'report_id' })
  report?: Reports | null;

  @Column({ type: 'uuid', nullable: true })
  report_id?: string | null;

  @Column({ type: 'text' })
  feedback_text: string;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'verified_at',
    comment: 'Expert verification timestamp',
  })
  verified_at: Date;
}
