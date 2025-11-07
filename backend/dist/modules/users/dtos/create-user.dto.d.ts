export declare class BaseUserDto {
    email: string;
    name: string;
    phone?: string;
    address?: string;
    avatar_url?: string;
}
export declare class CreateUserDto extends BaseUserDto {
    password: string;
}
export declare class CreateSocialUserDto extends BaseUserDto {
    auth_provider: string;
    provider_id: string;
    avatar_url?: string;
}
