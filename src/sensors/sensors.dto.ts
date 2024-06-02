import { IsString } from 'class-validator';
import mongoose from 'mongoose';
import { IsMongoId } from 'src/decorators/IsMongoId';

import { PartialType } from '@nestjs/mapped-types';

export class CreateSensorDTO {
  @IsString()
  name: string;

  @IsMongoId()
  subSystemId: mongoose.Types.ObjectId;

  @IsString()
  mqttTopic: string;
}

export class UpdateSensorDTO extends PartialType(CreateSensorDTO) {}
