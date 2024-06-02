import { IsNotEmpty, IsString } from 'class-validator';
import mongoose from 'mongoose';
import { IsMongoIdArray } from 'src/decorators/IsMongoId';

import { PartialType } from '@nestjs/mapped-types';

export class CreateSiteGroupDTO {
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsMongoIdArray()
  sites: mongoose.Types.ObjectId[];

  @IsNotEmpty()
  @IsMongoIdArray()
  siteGroupAdmins: mongoose.Types.ObjectId[];

  @IsNotEmpty()
  @IsMongoIdArray()
  admins: mongoose.Types.ObjectId[];

  @IsNotEmpty()
  @IsMongoIdArray()
  users: mongoose.Types.ObjectId[];
}

export class UpdateSiteGroupDTO extends PartialType(CreateSiteGroupDTO) {}
