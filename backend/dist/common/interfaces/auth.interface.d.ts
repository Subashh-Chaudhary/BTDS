import { Request } from 'express';
export interface UserWithPassword {
    id: string | number;
    email: string;
    name: string;
    password: string;
    [key: string]: any;
}
export interface AuthenticatedUser {
    id: string | number;
    email: string;
    name: string;
    auth_provider: string;
    provider_id: string;
    accessToken: string;
    refreshToken: string;
}
export interface GoogleAuthRequest extends Request {
    user: AuthenticatedUser;
}
export interface IUserData {
    id: string | number;
    email: string;
    name: string;
    auth_provider?: string;
    provider_id?: string;
}
