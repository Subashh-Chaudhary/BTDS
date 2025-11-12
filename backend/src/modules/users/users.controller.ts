import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Put,
  Post,
  Query,
  Request,
  Res,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
import { Request as ExpressRequest, Response } from 'express';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';
import { CloudinaryService } from 'src/common/services/cloudinary.service';

/**
 * Users Controller
 * Handles all user management operations (CRUD)
 * Note: Authentication and registration routes are handled in the auth module
 */
@Controller('')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Get all users with pagination
   * @param page - Page number (default: 1)
   * @param limit - Number of items per page (default: 10)
   * @param res - Response object
   * @returns Paginated list of users
   */
  @Get('users')
  async getAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Res() res: Response,
  ) {
    const result = await this.usersService.findAll(page, limit);
    const response = ResponseHelper.paginated(
      result.users,
      result.page,
      result.limit,
      result.total,
      'Users retrieved successfully',
      '/users',
      'GET',
    );
    return res.status(response.statusCode).json(response);
  }

  /**
   * Get user by ID
   * @param id - User ID
   * @param res - Response object
   * @returns User details
   */
  @Get('user/:id')
  async getUserById(@Param('id', new ParseUUIDPipe()) id: string, @Res() res: Response) {
    const user = await this.usersService.findById(id);

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    const response = ResponseHelper.success(
      userWithoutPassword,
      'User retrieved successfully',
      HttpStatus.OK,
      `/user/${id}`,
      'GET',
    );
    return res.status(response.statusCode).json(response);
  }

  /**
   * Update user by ID
   * @param id - User ID
   * @param updateUserDto - Update data
   * @param res - Response object
   * @returns Updated user
   */
  @Put('user/:id')
  async updateUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: Response,
  ) {
    const user = await this.usersService.updateUser(id, updateUserDto);

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    const response = ResponseHelper.success(
      userWithoutPassword,
      'User updated successfully',
      HttpStatus.OK,
      `/user/${id}`,
      'PUT',
    );
    return res.status(response.statusCode).json(response);
  }

  /**
   * Delete user by ID
   * @param id - User ID
   * @param res - Response object
   * @returns Success message
   */
  @Delete('user/:id')
  async deleteUser(@Param('id', new ParseUUIDPipe()) id: string, @Res() res: Response) {
    const result = await this.usersService.deleteUser(id);

    const response = ResponseHelper.success(
      result,
      'User deleted successfully',
      HttpStatus.OK,
      `/user/${id}`,
      'DELETE',
    );
    return res.status(response.statusCode).json(response);
  }

  /**
   * Get current user profile
   * @param req - Request object containing user ID from JWT
   * @param res - Response object
   * @returns Current user profile
   */
  @Get('profile')
  async getProfile(
    @Request() req: ExpressRequest & { user?: { id: string }; body?: any },
    @Res() res: Response,
  ) {
    const anyReq = req as any;
    const userId = (req.user && (req.user as any).id) || anyReq.query?.id || anyReq.body?.id;

    if (!userId) {
      const response = ResponseHelper.error(
        'User id not provided',
        'User identification is required',
        HttpStatus.BAD_REQUEST,
        '/profile',
        'GET',
      );
      return res.status(response.statusCode).json(response);
    }

    const user = await this.usersService.findById(userId);

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    const response = ResponseHelper.success(
      userWithoutPassword,
      'Profile retrieved successfully',
      HttpStatus.OK,
      '/profile',
      'GET',
    );
    return res.status(response.statusCode).json(response);
  }

  /**
   * Update current user profile
   * @param req - Request object containing user ID from JWT
   * @param updateData - Update data
   * @param res - Response object
   * @returns Updated user profile
   */
  @Put('profile')
  async updateProfile(
    @Request() req: ExpressRequest & { user?: { id: string }; body?: any },
    @Body() updateData: UpdateUserDto,
    @Res() res: Response,
  ) {
    const anyReq = req as any;
    const userId = (req.user && (req.user as any).id) || anyReq.body?.id || anyReq.query?.id;

    if (!userId) {
      const response = ResponseHelper.error(
        'User id not provided',
        'User identification is required',
        HttpStatus.BAD_REQUEST,
        '/profile',
        'PUT',
      );
      return res.status(response.statusCode).json(response);
    }

    const user = await this.usersService.updateUser(userId, updateData);

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    const response = ResponseHelper.success(
      userWithoutPassword,
      'Profile updated successfully',
      HttpStatus.OK,
      '/profile',
      'PUT',
    );
    return res.status(response.statusCode).json(response);
  }

  /**
   * Upload avatar for current user
   * Accepts multipart/form-data with field name 'avatar'
   */
  @Post('profile/avatar')
  @UseInterceptors(AnyFilesInterceptor())
  async uploadAvatar(
    @Request() req: ExpressRequest & { user?: { id: string }; body?: any },
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response,
  ) {
    // Ensure cloudinary service exists on controller (registered in module)
    if (!this.cloudinaryService || !this.cloudinaryService.uploadImageBuffer) {
      const response = ResponseHelper.error(
        'Avatar upload service not available',
        'Service unavailable',
        HttpStatus.INTERNAL_SERVER_ERROR,
        '/profile/avatar',
        'POST',
      );
      return res.status(response.statusCode).json(response);
    }

    // Support both 'avatar' and 'file' form field names by picking the matching file
    const file = (files || []).find((f) => f.fieldname === 'avatar') ||
      (files || [])[0];

    if (!file) {
      const response = ResponseHelper.error(
        'No file uploaded',
        'File is required',
        HttpStatus.BAD_REQUEST,
        '/profile/avatar',
        'POST',
      );
      return res.status(response.statusCode).json(response);
    }

    // Determine user id: prefer authenticated user, fall back to body.id or query.id
    const anyReq = req as any;
    const userId = (req.user && (req.user as any).id) || anyReq.body?.id || anyReq.query?.id;

    if (!userId) {
      const response = ResponseHelper.error(
        'User id not provided',
        'User identification is required',
        HttpStatus.BAD_REQUEST,
        '/profile/avatar',
        'POST',
      );
      return res.status(response.statusCode).json(response);
    }

    // Upload file buffer to cloudinary
    const url = await this.cloudinaryService.uploadImageBuffer(file, {
      folder: 'avatars',
    });

    // Update user's avatar_url
    const user = await this.usersService.updateUser(userId, {
      avatar_url: url,
    } as UpdateUserDto);

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    const response = ResponseHelper.success(
      userWithoutPassword,
      'Avatar uploaded successfully',
      HttpStatus.OK,
      '/profile/avatar',
      'POST',
    );
    return res.status(response.statusCode).json(response);
  }
}
