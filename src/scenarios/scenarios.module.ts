import { MqttModule } from 'src/mqtt/mqtt.module';
import { SensorsModule } from 'src/sensors/sensors.module';
import { SitesModule } from 'src/sites/sites.module';
import { SubSystemsModule } from 'src/sub-systems/sub-systems.module';

import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScenariosController } from './scenarios.controller';
import { ScenarioSchema } from './scenarios.schema';
import { ScenariosService } from './scenarios.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Scenarios', schema: ScenarioSchema }]),
    forwardRef(() => SitesModule),
    forwardRef(() => SubSystemsModule),
    forwardRef(() => SensorsModule),
    forwardRef(() => MqttModule),
  ],
  controllers: [ScenariosController],
  providers: [ScenariosService],
  exports: [ScenariosService],
})
export class ScenariosModule {}
