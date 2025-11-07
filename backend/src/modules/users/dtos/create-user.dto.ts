import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

// Base DTO for common user fields
export class BaseUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @Matches(/^[0-9]+$/, { message: 'phone must contain only numbers' })
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsUrl()
  avatar_url?: string;
}

// For registration with email/password
export class CreateUserDto extends BaseUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}

// For social login registration
export class CreateSocialUserDto extends BaseUserDto {
  @IsNotEmpty()
  @IsString()
  auth_provider: string;

  @IsNotEmpty()
  @IsString()
  provider_id: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;
}
