import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsInt, Min, Max, IsIn } from 'class-validator';

/**
 * DTO for updating user information
 * All fields are optional to allow partial updates
 */
export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password?: string;

  @IsOptional()
  @Matches(/^[0-9]+$/, { message: 'Phone must contain only numbers' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Please provide a valid URL for avatar' })
  avatar_url?: string;

  @IsOptional()
  @IsInt({ message: 'Age must be an integer' })
  @Min(0, { message: 'Age must be at least 0' })
  @Max(150, { message: 'Age must be less than or equal to 150' })
  age?: number;

  @IsOptional()
  @IsString({ message: 'Gender must be a string' })
  @IsIn(['male', 'female', 'other', 'prefer_not_to_say'], {
    message: 'Gender must be one of male, female, other, prefer_not_to_say',
  })
  gender?: string;

  @IsOptional()
  is_verified?: boolean;

  @IsOptional()
  is_active?: boolean;
}
