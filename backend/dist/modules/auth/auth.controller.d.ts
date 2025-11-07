import { Request } from 'express';
import { GoogleAuthRequest } from 'src/common/interfaces';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto, req: Request): Promise<import("src/common/interfaces").IApiSuccessResponse<{
        user: Record<string, unknown>;
        access_token: string;
    }>>;
    login(loginDto: LoginDto, req: Request): Promise<import("src/common/interfaces").IApiSuccessResponse<{
        user: Record<string, unknown>;
        access_token: string;
    }>>;
    verifyEmail(token: string, req: Request): Promise<import("src/common/interfaces").IApiSuccessResponse<{
        message: string;
    }>>;
    forgotPassword(email: string, req: Request): Promise<import("src/common/interfaces").IApiSuccessResponse<{
        message: string;
    }>>;
    resetPassword(token: string, newPassword: string, req: Request): Promise<import("src/common/interfaces").IApiSuccessResponse<{
        message: string;
    }>>;
    refreshToken(refreshToken: string, req: Request): Promise<import("src/common/interfaces").IApiSuccessResponse<{
        access_token: string;
    }>>;
    googleLogin(): void;
    googleLoginCallback(req: GoogleAuthRequest): import("src/common/interfaces").IApiSuccessResponse<{
        user: {
            id: string | number;
            email: string;
            name: string;
            auth_provider: string;
            provider_id: string;
        };
        access_token: string;
    }>;
}
