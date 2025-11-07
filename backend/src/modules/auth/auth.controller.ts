import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { GoogleAuthRequest } from 'src/common/interfaces';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

/**
 * Auth Controller
 * Handles authentication routes including login, registration, and Google OAuth
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user with email and password
   * @param registerDto - User registration data
   * @param req - Request object for path and method
   * @returns JWT token and user data
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Req() req: Request) {
    try {
      const result = await this.authService.register(registerDto);

      return ResponseHelper.success(
        {
          user: result.user,
          access_token: result.access_token,
        },
        'User registered successfully',
        HttpStatus.CREATED,
        req.url,
        req.method,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        ResponseHelper.error(
          'Registration failed',
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
          req.url,
          req.method,
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Login with email and password
   * @param loginDto - Login credentials
   * @param req - Request object for path and method
   * @returns JWT token and user data
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    try {
      console.log('Login', loginDto);
      const result = await this.authService.login(loginDto);

      return ResponseHelper.success(
        result,
        'Login successful',
        HttpStatus.OK,
        req.url,
        req.method,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        ResponseHelper.error(
          'Login failed',
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
          req.url,
          req.method,
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verify user email with verification token
   * @param token - Verification token from query parameter
   * @param req - Request object for path and method
   * @returns Success message
   */
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Req() req: Request) {
    try {
      if (!token) {
        throw new HttpException(
          ResponseHelper.error(
            'Verification failed',
            'Verification token is required',
            HttpStatus.BAD_REQUEST,
            req.url,
            req.method,
          ),
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.authService.verifyEmail(token);

      return ResponseHelper.success(
        result,
        'Email verified successfully',
        HttpStatus.OK,
        req.url,
        req.method,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        ResponseHelper.error(
          'Verification failed',
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
          req.url,
          req.method,
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Request password reset
   * @param email - Email from request body
   * @param req - Request object for path and method
   * @returns Success message
   */
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string, @Req() req: Request) {
    try {
      if (!email) {
        throw new HttpException(
          ResponseHelper.error(
            'Password reset failed',
            'Email is required',
            HttpStatus.BAD_REQUEST,
            req.url,
            req.method,
          ),
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.authService.requestPasswordReset(email);

      return ResponseHelper.success(
        result,
        'Password reset email sent',
        HttpStatus.OK,
        req.url,
        req.method,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        ResponseHelper.error(
          'Password reset failed',
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
          req.url,
          req.method,
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Reset password with reset token
   * @param token - Reset token from query parameter
   * @param newPassword - New password from request body
   * @param req - Request object for path and method
   * @returns Success message
   */
  @Post('reset-password')
  async resetPassword(
    @Query('token') token: string,
    @Body('newPassword') newPassword: string,
    @Req() req: Request,
  ) {
    try {
      if (!token || !newPassword) {
        throw new HttpException(
          ResponseHelper.error(
            'Password reset failed',
            'Reset token and new password are required',
            HttpStatus.BAD_REQUEST,
            req.url,
            req.method,
          ),
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.authService.resetPassword(token, newPassword);

      return ResponseHelper.success(
        result,
        'Password reset successfully',
        HttpStatus.OK,
        req.url,
        req.method,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        ResponseHelper.error(
          'Password reset failed',
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
          req.url,
          req.method,
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Refresh JWT token
   * @param refreshToken - Refresh token from request body
   * @param req - Request object for path and method
   * @returns New access token
   */
  @Post('refresh-token')
  async refreshToken(
    @Body('refreshToken') refreshToken: string,
    @Req() req: Request,
  ) {
    try {
      if (!refreshToken) {
        throw new HttpException(
          ResponseHelper.error(
            'Token refresh failed',
            'Refresh token is required',
            HttpStatus.BAD_REQUEST,
            req.url,
            req.method,
          ),
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.authService.refreshToken(refreshToken);

      return ResponseHelper.success(
        result,
        'Token refreshed successfully',
        HttpStatus.OK,
        req.url,
        req.method,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        ResponseHelper.error(
          'Token refresh failed',
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
          req.url,
          req.method,
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Initiate Google OAuth login
   * @returns Redirects to Google OAuth
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // This will redirect to Google OAuth
  }

  /**
   * Google OAuth callback
   * @param req - Request object containing user data from Google
   * @returns JWT token and user data
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleLoginCallback(@Req() req: GoogleAuthRequest) {
    try {
      const { user } = req;
      const token = this.authService.generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        auth_provider: 'google',
        provider_id: user.provider_id,
      });

      return ResponseHelper.success(
        {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            auth_provider: user.auth_provider,
            provider_id: user.provider_id,
          },
          access_token: token,
        },
        'Google login successful',
        HttpStatus.OK,
        req.url,
        req.method,
      );
    } catch {
      throw new HttpException(
        ResponseHelper.error(
          'Google login failed',
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
          req.url,
          req.method,
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
