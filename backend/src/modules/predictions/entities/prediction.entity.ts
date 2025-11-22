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

  // (model_type removed) - entity now stores diabetes-specific fields directly

  // Optional reference to the user who requested prediction
  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  // (confidence, description and output_image_url removed per request)

  // Diabetes-specific fields (nullable to keep compatibility with other models)
  @Column({ type: 'integer', nullable: true })
  pregnancies: number | null;

  @Column({ type: 'integer', nullable: true })
  glucose: number | null;

  @Column({ type: 'integer', nullable: true })
  blood_pressure: number | null;

  @Column({ type: 'integer', nullable: true })
  skin_thickness: number | null;

  @Column({ type: 'integer', nullable: true })
  insulin: number | null;

  @Column({ type: 'double precision', nullable: true })
  bmi: number | null;

  @Column({ type: 'double precision', nullable: true })
  diabetes_pedigree_function: number | null;

  @Column({ type: 'integer', nullable: true })
  age: number | null;

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
