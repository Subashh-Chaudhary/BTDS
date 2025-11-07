import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from '../../users/entities/users.entity';
import { Prediction } from '../../predictions/entities/prediction.entity';

@Entity('scans')
export class Scan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 512 })
  image_url: string;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @Column()
  user_id: string;

  @OneToOne(() => Prediction, { nullable: true })
  @JoinColumn({ name: 'prediction_id' })
  model_prediction: Prediction;

  @Column({ name: 'prediction_id', nullable: true })
  model_prediction_id: string;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'uploaded_at',
    comment: 'MRI scan upload timestamp',
  })
  uploaded_at: Date;
}
