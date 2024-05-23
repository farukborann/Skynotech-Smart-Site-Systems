import { Module } from '@nestjs/common';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SiteSchema } from './sites.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Sites', schema: SiteSchema }])],
  controllers: [SitesController],
  providers: [SitesService],
})
export class SitesModule {}
