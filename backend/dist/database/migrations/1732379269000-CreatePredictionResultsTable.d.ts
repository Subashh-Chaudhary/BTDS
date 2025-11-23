import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CreatePredictionResultsTable1732379269000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
