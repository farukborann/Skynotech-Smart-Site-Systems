import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { SubSystemsModule } from 'src/sub-systems/sub-systems.module';
import { SitesModule } from 'src/sites/sites.module';

@Module({
  imports: [SubSystemsModule, SitesModule],
  providers: [MqttService],
})
export class MqttModule {}
