import { forwardRef, Module } from '@nestjs/common';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SiteSchema } from './sites.schema';
import { MqttModule } from 'src/mqtt/mqtt.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Sites', schema: SiteSchema }]),
    forwardRef(() => MqttModule),
  ],
  controllers: [SitesController],
  providers: [SitesService],
  exports: [SitesService],
})
export class SitesModule {}
