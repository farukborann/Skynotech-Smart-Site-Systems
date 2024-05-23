import { IsString } from 'class-validator';

export class CreateSiteDTO {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  province: string;

  @IsString()
  district: string;
}
