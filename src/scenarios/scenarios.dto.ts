import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';
import { IsMongoId } from 'src/decorators/IsMongoId';
import { UpdateIgnitionStatusDTO } from 'src/sub-systems/sub-systems.dto';

import { PartialType } from '@nestjs/mapped-types';

export class CreateScenarioDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsMongoId()
  @IsNotEmpty()
  sensorId: mongoose.Types.ObjectId;

  @IsNumber()
  @IsNotEmpty()
  min: number;

  @IsNumber()
  @IsNotEmpty()
  max: number;

  @IsDate()
  @Type(() => Date)
  startDate: string;

  @IsDate()
  @Type(() => Date)
  endDate: string;

  @ValidateNested({ each: true })
  @Type(() => UpdateIgnitionStatusDTO)
  @IsNotEmpty()
  @ArrayMinSize(1)
  ignitions: UpdateIgnitionStatusDTO[];
}

export class UpdateScenarioDTO extends PartialType(CreateScenarioDTO) {}
