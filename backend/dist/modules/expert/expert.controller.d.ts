import { Request as ExpressRequest, Response } from 'express';
import { CreateExpertDto } from './dtos/create-expert.dto';
import { UpdateExpertDto } from './dtos/update-expert.dto';
import { ExpertService } from './expert.service';
export declare class ExpertController {
    private readonly expertService;
    constructor(expertService: ExpertService);
    createExpert(createExpertDto: CreateExpertDto, res: Response): Promise<Response<any, Record<string, any>>>;
    getAllExperts(page: number | undefined, limit: number | undefined, res: Response): Promise<Response<any, Record<string, any>>>;
    getActiveExperts(page: number | undefined, limit: number | undefined, res: Response): Promise<Response<any, Record<string, any>>>;
    getExpertById(id: string, res: Response): Promise<Response<any, Record<string, any>>>;
    updateExpert(id: string, updateExpertDto: UpdateExpertDto, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteExpert(id: string, res: Response): Promise<Response<any, Record<string, any>>>;
    getProfile(req: ExpressRequest & {
        user: {
            id: string;
        };
    }, res: Response): Promise<Response<any, Record<string, any>>>;
    updateProfile(req: ExpressRequest & {
        user: {
            id: string;
        };
    }, updateData: UpdateExpertDto, res: Response): Promise<Response<any, Record<string, any>>>;
    getExpertByVerificationToken(token: string, res: Response): Promise<Response<any, Record<string, any>>>;
    getExpertByPasswordResetToken(token: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
