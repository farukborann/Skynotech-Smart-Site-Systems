import { forwardRef, Module } from '@nestjs/common';
import { SensorsController } from './sensors.controller';
import { SensorsService } from './sensors.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SensorSchema } from './sensors.schema';
import { SubSystemsModule } from 'src/sub-systems/sub-systems.module';
import { MqttModule } from 'src/mqtt/mqtt.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Sensors', schema: SensorSchema }]),
    SubSystemsModule,
    forwardRef(() => MqttModule),
  ],
  controllers: [SensorsController],
  providers: [SensorsService],
  exports: [SensorsService],
})
export class SensorsModule {}
