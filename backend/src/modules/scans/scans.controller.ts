import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ScansService } from './scans.service';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Users } from '../users/entities/users.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IApiResponse } from '../../common/interfaces/api-response.interface';

@Controller('scans')
export class ScansController {
  constructor(private readonly scansService: ScansService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadMriScan(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: Users,
  ): Promise<IApiResponse> {
    const scan = await this.scansService.uploadMriScan(user.id, file);
    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: 'MRI scan uploaded successfully',
      data: scan,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get()
  async findAll(): Promise<IApiResponse> {
    const scans = await this.scansService.findAll();
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'All scans retrieved successfully',
      data: scans,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IApiResponse> {
    const scan = await this.scansService.findOne(id);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Scan retrieved successfully',
      data: scan,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string): Promise<IApiResponse> {
    const scans = await this.scansService.findByUser(userId);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'User scans retrieved successfully',
      data: scans,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }
}
