import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class ChangeUsersIsActiveDefault1700000000003 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
