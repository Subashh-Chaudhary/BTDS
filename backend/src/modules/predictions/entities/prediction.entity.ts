import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('predictions')
export class Prediction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  tumor_type: string;

  @Column({ type: 'float' })
  confidence_score: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 512, nullable: true })
  output_image_url: string;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    comment: 'Prediction creation timestamp',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    comment: 'Last update timestamp',
  })
  updated_at: Date;
}
