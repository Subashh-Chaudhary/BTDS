export declare class Users {
    id: string;
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    avatar_url: string;
    age: number;
    gender: string;
    is_verified: boolean;
    is_active: boolean;
    verification_token: string;
    verification_token_expires_at: Date;
    password_reset_token: string;
    reset_token_expires_at: Date;
    refresh_token: string;
    refresh_token_expires_at: Date;
    last_login_at: Date;
    auth_provider: string;
    provider_id: string;
    is_admin: boolean;
    created_at: Date;
    updated_at: Date;
}
