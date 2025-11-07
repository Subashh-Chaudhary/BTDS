export interface UserTokens {
    verification_token?: string | null;
    verification_token_expires_at?: Date | null;
    password_reset_token?: string | null;
    reset_token_expires_at?: Date | null;
    refresh_token?: string | null;
    refresh_token_expires_at?: Date | null;
}
export interface TokenData {
    token: string;
    expiresAt: Date;
}
export interface TokenValidationResult {
    isValid: boolean;
    isExpired: boolean;
    message?: string;
}
export declare class TokenManagerService {
    generateVerificationToken(expiryHours?: number): TokenData;
    generatePasswordResetToken(expiryHours?: number): TokenData;
    generateRefreshToken(expiryDays?: number): TokenData;
    validateToken(token: string, expiresAt: Date): TokenValidationResult;
    isTokenExpired(expiresAt: Date | null | undefined): boolean;
    getTimeRemaining(expiresAt: Date): number;
    cleanExpiredTokens(user: UserTokens): UserTokens;
}
