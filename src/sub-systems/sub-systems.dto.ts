import { IsBoolean, IsEnum, IsNumber, IsString } from 'class-validator';
import mongoose from 'mongoose';
import { IsMongoId } from 'src/decorators/IsMongoId';

import { PartialType } from '@nestjs/mapped-types';
import { SystemTypeEnum } from './sub-systems.enum';

export class CreateSubSystemDTO {
  @IsEnum(SystemTypeEnum)
  systemType: string;

  @IsMongoId()
  siteId: mongoose.Types.ObjectId;

  @IsString()
  mqttTopic: string;

  @IsNumber()
  ignitionCount: number;
}

export class UpdateSubSystemDTO extends PartialType(CreateSubSystemDTO) {}

export class UpdateIgnitionStatusDTO {
  @IsNumber()
  ignitionIndex: number;

  @IsBoolean()
  status: boolean;
}
