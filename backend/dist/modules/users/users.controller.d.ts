import { Request as ExpressRequest, Response } from 'express';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';
import { CloudinaryService } from 'src/common/services/cloudinary.service';
export declare class UsersController {
    private readonly usersService;
    private readonly cloudinaryService;
    constructor(usersService: UsersService, cloudinaryService: CloudinaryService);
    getAllUsers(page: number | undefined, limit: number | undefined, res: Response): Promise<Response<any, Record<string, any>>>;
    getUserById(id: string, res: Response): Promise<Response<any, Record<string, any>>>;
    updateUser(id: string, updateUserDto: UpdateUserDto, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteUser(id: string, res: Response): Promise<Response<any, Record<string, any>>>;
    getProfile(req: ExpressRequest & {
        user?: {
            id: string;
        };
        body?: any;
    }, res: Response): Promise<Response<any, Record<string, any>>>;
    updateProfile(req: ExpressRequest & {
        user?: {
            id: string;
        };
        body?: any;
    }, updateData: UpdateUserDto, res: Response): Promise<Response<any, Record<string, any>>>;
    uploadAvatar(req: ExpressRequest & {
        user?: {
            id: string;
        };
        body?: any;
    }, files: Express.Multer.File[], res: Response): Promise<Response<any, Record<string, any>>>;
}
