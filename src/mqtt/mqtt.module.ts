import { ScenariosModule } from 'src/scenarios/scenarios.module';
import { SensorsModule } from 'src/sensors/sensors.module';
import { SitesModule } from 'src/sites/sites.module';
import { SubSystemsModule } from 'src/sub-systems/sub-systems.module';

import { forwardRef, Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';

@Module({
  imports: [
    forwardRef(() => SitesModule),
    SubSystemsModule,
    forwardRef(() => SensorsModule),
    forwardRef(() => ScenariosModule),
  ],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
