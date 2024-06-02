import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { RoleEnum } from 'src/access-control/access-control.enum';

import { PartialType } from '@nestjs/mapped-types';

export class CreateUserDTO {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  phoneNumber: string;

  @IsEnum(RoleEnum)
  @IsNotEmpty()
  role: string;
}

export class UpdateUserDTO extends PartialType(CreateUserDTO) {}

export class UpdatePrivacySettingsDTO {
  @IsBoolean()
  showEmail: boolean;

  @IsBoolean()
  showPhoneNumber: boolean;

  @IsBoolean()
  showProfilePhoto: boolean;
}
