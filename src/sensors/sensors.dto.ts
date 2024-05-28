import { IsMongoId, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateSensorDTO {
  @IsString()
  name: string;

  @IsMongoId()
  subSystemId: string;

  @IsString()
  mqttTopic: string;
}

export class UpdateSensorDTO extends PartialType(CreateSensorDTO) {}
