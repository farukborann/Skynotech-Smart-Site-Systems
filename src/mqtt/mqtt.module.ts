import { forwardRef, Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { SubSystemsModule } from 'src/sub-systems/sub-systems.module';
import { SitesModule } from 'src/sites/sites.module';
import { SensorsModule } from 'src/sensors/sensors.module';

@Module({
  imports: [forwardRef(() => SitesModule), SubSystemsModule, SensorsModule],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
