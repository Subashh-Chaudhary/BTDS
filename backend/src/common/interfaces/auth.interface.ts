import { Request } from 'express';

// Interface for user objects from different tables
export interface UserWithPassword {
  id: string | number;
  email: string;
  name: string;
  password: string;
  [key: string]: any;
}

// Interface for authenticated user from Google OAuth
export interface AuthenticatedUser {
  id: string | number;
  email: string;
  name: string;
  auth_provider: string;
  provider_id: string;
  accessToken: string;
  refreshToken: string;
}

// Extended request interface for Google OAuth
export interface GoogleAuthRequest extends Request {
  user: AuthenticatedUser;
}

// Interface for user data in JWT payload
export interface IUserData {
  id: string | number;
  email: string;
  name: string;
  auth_provider?: string;
  provider_id?: string;
}
