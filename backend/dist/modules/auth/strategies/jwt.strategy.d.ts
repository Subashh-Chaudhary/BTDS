import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { UsersRepository } from '../../users/repositories/users.repository';
import { ExpertRepository } from '../../expert/repositories';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private usersRepository;
    private expertRepository;
    private configService;
    constructor(usersRepository: UsersRepository, expertRepository: ExpertRepository, configService: ConfigService);
    validate(payload: {
        sub: string;
        email: string;
    }): Promise<import("../../users/entities/users.entity").Users | import("../../expert/entities/expert.entity").Experts>;
}
export {};
