import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { RoleEnum } from 'src/access-control/access-control.enum';

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
