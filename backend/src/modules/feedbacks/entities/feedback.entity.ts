import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Scan } from '../../scans/entities/scan.entity';
import { Experts } from '../../expert/entities/expert.entity';

@Entity()
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

  @Column({ type: 'text' })
  feedback_text: string;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'verified_at',
    comment: 'Expert verification timestamp',
  })
  verified_at: Date;
}
