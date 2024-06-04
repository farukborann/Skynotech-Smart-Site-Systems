import { IsString } from 'class-validator';
import mongoose from 'mongoose';
import { IsMongoIdArray } from 'src/decorators/IsMongoId';

import { PartialType } from '@nestjs/mapped-types';

export class CreateSiteGroupDTO {
  @IsString()
  name: string;

  @IsMongoIdArray()
  sites: mongoose.Types.ObjectId[];

  @IsMongoIdArray()
  siteGroupAdmins: mongoose.Types.ObjectId[];

  @IsMongoIdArray()
  admins: mongoose.Types.ObjectId[];

  @IsMongoIdArray()
  users: mongoose.Types.ObjectId[];
}

export class UpdateSiteGroupDTO extends PartialType(CreateSiteGroupDTO) {}
