import { ExpertService } from 'src/modules/expert/expert.service';
import { CreateSocialUserDto } from 'src/modules/users/dtos/create-user.dto';
import { UsersRepository } from 'src/modules/users/repositories/users.repository';
export declare class SocialAuthService {
    private readonly usersRepository;
    private readonly expertService;
    constructor(usersRepository: UsersRepository, expertService: ExpertService);
    authenticate(profile: CreateSocialUserDto): Promise<import("../../expert/entities/expert.entity").Experts | import("../../users/entities/users.entity").Users>;
}
