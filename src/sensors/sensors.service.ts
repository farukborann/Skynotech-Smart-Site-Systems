import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Sensor } from './sensors.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateSensorDTO } from './sensors.dto';
import { SubSystemsService } from 'src/sub-systems/sub-systems.service';
import { SessionUser, SystemSession } from 'src/auth/session.interface';
import { MqttService } from 'src/mqtt/mqtt.service';
import moongose from 'mongoose';

@Injectable()
export class SensorsService {
  constructor(
    @InjectModel('Sensors') private sensorsModel: Model<Sensor>,
    private readonly subSystemsService: SubSystemsService,
    @Inject(forwardRef(() => MqttService))
    private readonly mqttService: MqttService,
  ) {}

  async checkUserAccessToSensor(sensorId: string, user: SessionUser) {
    const sensor = await this.sensorsModel.findById(sensorId).exec();

    if (!sensor) return false;

    return this.subSystemsService.checkUserAccessToSubSystem(
      sensor.subSystemId.toString(),
      user,
    );
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

    this.mqttService.subscribeForSensor(res._id.toString());
  }

  async getAllSensors() {
    return this.sensorsModel.find().exec();
  }

  async getSensorById(id: string, user: SessionUser) {
    if (!(await this.checkUserAccessToSensor(id, user)))
      throw new ForbiddenException('User has no access to this sensor');

    return this.sensorsModel.findById(id).exec();
  }

  async getSensorsBySubSystemId(subSystemId: string, user: SessionUser) {
    if (
      !(await this.subSystemsService.checkUserAccessToSubSystem(
        subSystemId,
        user,
      ))
    )
      throw new ForbiddenException('User has no access to this subSystem');

    return this.sensorsModel
      .find({ subSystemId: new moongose.Types.ObjectId(subSystemId) })
      .exec();
  }

  async deleteSensor(id: string) {
    return this.sensorsModel.findByIdAndDelete(id).exec();
  }

  async updateSensor(id: string, sensor: CreateSensorDTO) {
    const subSystem = this.subSystemsService.getSubSystemById(
      sensor.subSystemId,
      SystemSession,
    );

    if (!subSystem) {
      throw new NotFoundException('SubSystem not found');
    }

    return this.sensorsModel
      .findByIdAndUpdate(id, sensor, { new: true })
      .exec();
  }
}
