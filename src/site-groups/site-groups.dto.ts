import { IsString } from 'class-validator';
import mongoose from 'mongoose';
import { IsMongoId } from 'src/decorators/IsMongoId';

import { PartialType } from '@nestjs/mapped-types';

export class CreateSiteGroupDTO {
  @IsString()
  name: string;

  @IsMongoId({ each: true })
  sites: mongoose.Types.ObjectId[];

  @IsMongoId({ each: true })
  siteGroupAdmins: mongoose.Types.ObjectId[];

  @IsMongoId({ each: true })
  admins: mongoose.Types.ObjectId[];

  @IsMongoId({ each: true })
  users: mongoose.Types.ObjectId[];
}

export class UpdateSiteGroupDTO extends PartialType(CreateSiteGroupDTO) {}
