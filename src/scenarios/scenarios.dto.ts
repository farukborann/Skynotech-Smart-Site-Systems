import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import mongoose from 'mongoose';
import { IsMongoId } from 'src/decorators/IsMongoId';

import { PartialType } from '@nestjs/mapped-types';

export class CreateScenarioDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsMongoId()
  subSystemId: mongoose.Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  sensorId?: mongoose.Types.ObjectId;

  @IsOptional()
  @IsNumber()
  min?: number;

  @IsOptional()
  @IsNumber()
  max?: number;

  @IsDate()
  @Type(() => Date)
  startDate: string;

  @IsDate()
  @Type(() => Date)
  endDate: string;

  @Type(() => Object)
  @IsObject()
  ignitions: { [key: string]: 1 | 0 };
}

export class UpdateScenarioDTO extends PartialType(CreateScenarioDTO) {}
