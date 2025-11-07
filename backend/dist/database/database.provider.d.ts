import { OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AdminSeeder } from './seeds/admin.seeder';
export declare class DatabaseService implements OnModuleInit {
    private readonly dataSource;
    private readonly adminSeeder;
    private readonly logger;
    constructor(dataSource: DataSource, adminSeeder: AdminSeeder);
    onModuleInit(): Promise<void>;
}
