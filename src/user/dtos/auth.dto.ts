import { UserRole } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @IsEmail()
  email: string;

  @IsStrongPassword({
    minLength: 5,
    minNumbers: 2,
    minLowercase: 1,
    minUppercase: 1,
    minSymbols: 1,
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  productKey: string;
}

export class SignInDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ProductKeyCreationDto {
  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  userRole: UserRole;
}
