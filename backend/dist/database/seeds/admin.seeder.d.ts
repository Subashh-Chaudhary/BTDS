import { ConfigService } from '@nestjs/config';
import { UsersRepository } from '../../modules/users/repositories/users.repository';
export declare class AdminSeeder {
    private usersRepository;
    private configService;
    constructor(usersRepository: UsersRepository, configService: ConfigService);
    seed(): Promise<void>;
    getAdminCredentials(): {
        email: string;
        password: string;
    };
}
