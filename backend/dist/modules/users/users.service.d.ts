import { Repository } from 'typeorm';
import { CreateSocialUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Users } from './entities/users.entity';
import { UsersRepository } from './repositories/users.repository';
export declare class UsersService {
    private userRepository;
    private readonly usersRepository;
    constructor(userRepository: Repository<Users>, usersRepository: UsersRepository);
    findById(id: string): Promise<Users>;
    findByEmail(email: string): Promise<Users | undefined>;
    findAll(page?: number, limit?: number): Promise<{
        users: Users[];
        total: number;
        page: number;
        limit: number;
    }>;
    updateUser(id: string, updateData: UpdateUserDto): Promise<Users>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
    findBySocialId(provider: string, socialId: string): Promise<Users | undefined>;
    createSocialUser(profile: CreateSocialUserDto): Promise<Users>;
}
