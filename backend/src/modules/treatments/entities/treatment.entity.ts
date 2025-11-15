import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Prediction } from '../../predictions/entities/prediction.entity';

@Entity('treatments')
export class Treatment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Prediction, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'prediction_id' })
  prediction: Prediction;

  @Column()
  prediction_id: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  medication: string;

  @Column({ length: 255, nullable: true })
  therapy_type: string;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    comment: 'Treatment creation timestamp',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    comment: 'Last update timestamp',
  })
  updated_at: Date;
}
