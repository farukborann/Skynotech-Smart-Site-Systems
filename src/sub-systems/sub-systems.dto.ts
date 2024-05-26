import { IsEnum, IsMongoId, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { SystemTypeEnum } from './sub-systems.enum';

export class CreateSubSystemDTO {
  @IsEnum(SystemTypeEnum)
  systemType: string;

  @IsMongoId()
  siteId: string;

  @IsString()
  mqttTopic: string;
}

export class UpdateSubSystemDTO extends PartialType(CreateSubSystemDTO) {}
