import { IsMongoId, IsString } from 'class-validator';
import mongoose from 'mongoose';

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

  @IsString()
  mqttTopic: string;

  @IsMongoId({ each: true })
  admins: mongoose.Types.ObjectId[];

  @IsMongoId({ each: true })
  users: mongoose.Types.ObjectId[];
}

export class UpdateSiteDTO extends PartialType(CreateSiteDTO) {}
