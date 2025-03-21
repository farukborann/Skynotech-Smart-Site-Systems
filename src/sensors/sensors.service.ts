import mongoose, { Model } from 'mongoose';
import moongose from 'mongoose';
import { SessionUser, SystemSession } from 'src/auth/session.interface';
import { MqttService } from 'src/mqtt/mqtt.service';
import { SubSystemsService } from 'src/sub-systems/sub-systems.service';

import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateSensorDTO, UpdateSensorDTO } from './sensors.dto';
import { Sensor } from './sensors.schema';

@Injectable()
export class SensorsService {
  constructor(
    @InjectModel('Sensors') private sensorsModel: Model<Sensor>,
    private readonly subSystemsService: SubSystemsService,
    @Inject(forwardRef(() => MqttService))
    private readonly mqttService: MqttService,
  ) {}

  async checkUserAccessToSensor(
    sensorId: mongoose.Types.ObjectId,
    user: SessionUser,
  ) {
    const sensor = await this.sensorsModel.findById(sensorId).exec();

    if (!sensor) throw new NotFoundException('Sensor not found');

    await this.subSystemsService.checkUserAccessToSubSystem(
      sensor.subSystemId,
      user,
    );

    return sensor;
  }

  async createSensor(sensor: CreateSensorDTO) {
    const subSystem = await this.subSystemsService.getSubSystemById(
      sensor.subSystemId,
      SystemSession,
    );

    if (!subSystem) {
      throw new NotFoundException('SubSystem not found');
    }

    const res = await this.sensorsModel.create({
      ...sensor,
      subSystemId: subSystem._id,
    });

    await this.mqttService.subscribeForSensor(res._id);

    return res;
  }

  async getAllSensors() {
    return await this.sensorsModel.find().exec();
  }

  async getSensorById(id: mongoose.Types.ObjectId, user: SessionUser) {
    return await this.checkUserAccessToSensor(id, user);
  }

  async getSensorsBySubSystemId(
    subSystemId: mongoose.Types.ObjectId,
    user: SessionUser,
  ) {
    await this.subSystemsService.checkUserAccessToSubSystem(subSystemId, user);

    return await this.sensorsModel
      .find({ subSystemId: new moongose.Types.ObjectId(subSystemId) })
      .exec();
  }

  async deleteSensor(id: mongoose.Types.ObjectId) {
    const sensor = await this.sensorsModel.findById(id).exec();

    if (!sensor) {
      throw new NotFoundException('Sensor not found');
    }

    const res = await sensor.deleteOne();

    await this.mqttService.unsubscribeForSensor(id);
    await this.mqttService.deleteSensorsScenarios(id);

    return res;
  }

  async updateSensor(id: mongoose.Types.ObjectId, data: UpdateSensorDTO) {
    const sensor = await this.sensorsModel.findById(id).exec();

    if (!sensor) {
      throw new NotFoundException('Sensor not found');
    }

    if (data.subSystemId) {
      const subSystem = await this.subSystemsService.getSubSystemById(
        data.subSystemId,
        SystemSession,
      );

      if (!subSystem) {
        throw new NotFoundException('SubSystem not found');
      }
    }

    const res = await this.sensorsModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();

    if (data.mqttTopic !== sensor.mqttTopic) {
      await this.mqttService.unsubscribeForSensor(id);
      await this.mqttService.subscribeForSensor(id);
    }

    return res;
  }

  async getSensorValueById(id: mongoose.Types.ObjectId, user: SessionUser) {
    await this.checkUserAccessToSensor(id, user);
    return await this.mqttService.getSensorsLastValue(id);
  }
}
