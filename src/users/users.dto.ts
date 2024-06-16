import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import mongoose from 'mongoose';
import { RoleEnum } from 'src/access-control/access-control.enum';
import { IsMongoId } from 'src/decorators/IsMongoId';

import { PartialType } from '@nestjs/mapped-types';

export class CreateUserDTO {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  phoneNumber: string;

  @IsEnum(RoleEnum)
  @IsNotEmpty()
  role: string;
}

export class UpdateUserDTO extends PartialType(CreateUserDTO) {
  @IsString()
  profilePhoto: string;
}

export class UpdatePrivacySettingsDTO {
  @IsBoolean()
  showEmail: boolean;

  @IsBoolean()
  showPhoneNumber: boolean;

  @IsBoolean()
  showProfilePhoto: boolean;
}

export class GetExternalUserDTO {
  @IsMongoId()
  userId: mongoose.Types.ObjectId;

  @IsMongoId()
  siteId: mongoose.Types.ObjectId;
}
