import { IsMongoId, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateSiteDTO {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  province: string;

  @IsString()
  district: string;

  @IsMongoId({ each: true })
  users: string[];
}

export class UpdateSiteDTO extends PartialType(CreateSiteDTO) {}
