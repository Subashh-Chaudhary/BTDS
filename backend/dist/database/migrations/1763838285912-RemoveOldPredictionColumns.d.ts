import { MigrationInterface, QueryRunner } from "typeorm";
export declare class RemoveOldPredictionColumns1763838285912 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
