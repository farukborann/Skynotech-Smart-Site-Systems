import { IsMongoId, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateSiteGroupDTO {
  @IsString()
  name: string;

  @IsMongoId({ each: true })
  sites: string[];

  @IsMongoId({ each: true })
  siteGroupAdmins: string[];

  @IsMongoId({ each: true })
  admins: string[];

  @IsMongoId({ each: true })
  users: string[];
}

export class UpdateSiteGroupDTO extends PartialType(CreateSiteGroupDTO) {}
