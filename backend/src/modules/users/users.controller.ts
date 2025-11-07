import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
  Query,
  Request,
  Res,
} from '@nestjs/common';
import { Request as ExpressRequest, Response } from 'express';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';

/**
 * Users Controller
 * Handles all user management operations (CRUD)
 * Note: Authentication and registration routes are handled in the auth module
 */
@Controller('')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
  async getUserById(@Param('id') id: string, @Res() res: Response) {
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
    @Param('id') id: string,
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
  async deleteUser(@Param('id') id: string, @Res() res: Response) {
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
    @Request() req: ExpressRequest & { user: { id: string } },
    @Res() res: Response,
  ) {
    const user = await this.usersService.findById(req.user.id);

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
    @Request() req: ExpressRequest & { user: { id: string } },
    @Body() updateData: UpdateUserDto,
    @Res() res: Response,
  ) {
    const user = await this.usersService.updateUser(req.user.id, updateData);

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
}
