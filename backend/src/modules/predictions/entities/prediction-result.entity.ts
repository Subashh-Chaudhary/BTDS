import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Prediction } from './prediction.entity';

@Entity('prediction_results')
export class PredictionResult {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Foreign key to predictions table
    @Column({ type: 'uuid' })
    prediction_id: string;

    // Relation to Prediction entity
    @ManyToOne(() => Prediction, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'prediction_id' })
    prediction: Prediction;

    // Model name (random_forest, logistic_regression, svm)
    @Column({ type: 'varchar', length: 50 })
    model_name: string;

    // Prediction result (0 or 1)
    @Column({ type: 'integer' })
    prediction_value: number;

    // Probability/confidence score (0.0 to 1.0)
    @Column({ type: 'double precision' })
    probability: number;

    // Ensemble prediction (majority vote)
    @Column({ type: 'integer', nullable: true })
    ensemble_prediction: number | null;

    // Average confidence across all models
    @Column({ type: 'double precision', nullable: true })
    ensemble_confidence: number | null;

    @CreateDateColumn({
        type: 'timestamp with time zone',
        comment: 'Prediction result creation timestamp',
    })
    created_at: Date;

    @UpdateDateColumn({
        type: 'timestamp with time zone',
        comment: 'Last update timestamp',
    })
    updated_at: Date;
}
