import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreatePredictionResultsTable1732379269000 implements MigrationInterface {
    name = 'CreatePredictionResultsTable1732379269000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create prediction_results table
        await queryRunner.createTable(
            new Table({
                name: 'prediction_results',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'prediction_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'model_name',
                        type: 'varchar',
                        length: '50',
                        isNullable: false,
                    },
                    {
                        name: 'prediction_value',
                        type: 'integer',
                        isNullable: false,
                    },
                    {
                        name: 'probability',
                        type: 'double precision',
                        isNullable: false,
                    },
                    {
                        name: 'ensemble_prediction',
                        type: 'integer',
                        isNullable: true,
                    },
                    {
                        name: 'ensemble_confidence',
                        type: 'double precision',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp with time zone',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp with time zone',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                ],
            }),
            true,
        );

        // Create foreign key constraint
        await queryRunner.createForeignKey(
            'prediction_results',
            new TableForeignKey({
                name: 'FK_prediction_results_prediction_id',
                columnNames: ['prediction_id'],
                referencedTableName: 'predictions',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }),
        );

        // Create index on prediction_id for faster lookups
        await queryRunner.query(
            `CREATE INDEX "IDX_prediction_results_prediction_id" ON "prediction_results" ("prediction_id")`
        );

        // Create index on model_name for filtering by model
        await queryRunner.query(
            `CREATE INDEX "IDX_prediction_results_model_name" ON "prediction_results" ("model_name")`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_prediction_results_model_name"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_prediction_results_prediction_id"`);

        // Drop foreign key
        await queryRunner.dropForeignKey('prediction_results', 'FK_prediction_results_prediction_id');

        // Drop table
        await queryRunner.dropTable('prediction_results');
    }
}
