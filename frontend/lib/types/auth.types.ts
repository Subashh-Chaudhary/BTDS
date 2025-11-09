export type UserRole = 'farmer' | 'expert';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  user_type: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    address?: string;
    avatar?: string;
    is_admin?: boolean;
    is_verified?: boolean;
  };
  access_token: string;
}

export interface AuthStore {
  user: AuthResponse['user'] | null;
  token: string | null;
  isAuthenticated: boolean;
  initialized: boolean;
  initializeAuth: () => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}