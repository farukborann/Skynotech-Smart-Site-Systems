import { IsString } from 'class-validator';
import mongoose from 'mongoose';
import { IsMongoIdArray } from 'src/decorators/IsMongoId';

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

  @IsMongoIdArray()
  admins: mongoose.Types.ObjectId[];

  @IsMongoIdArray()
  users: mongoose.Types.ObjectId[];
}

export class UpdateSiteDTO extends PartialType(CreateSiteDTO) {}
