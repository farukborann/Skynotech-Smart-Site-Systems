import mongoose, { Model } from 'mongoose';
import { SessionUser, SystemSession } from 'src/auth/session.interface';
import { MqttService } from 'src/mqtt/mqtt.service';
import { SensorsService } from 'src/sensors/sensors.service';

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateScenarioDTO, UpdateScenarioDTO } from './scenarios.dto';
import { Scenario } from './scenarios.schema';

@Injectable()
export class ScenariosService {
  constructor(
    @InjectModel('Scenarios') private readonly scenariosModel: Model<Scenario>,
    @Inject(forwardRef(() => SensorsService))
    private readonly sensorsService: SensorsService,
    @Inject(forwardRef(() => MqttService))
    private readonly mqttService: MqttService,
  ) {}

  async getScenariosBySensorId(
    sensorId: mongoose.Types.ObjectId,
    user: SessionUser,
  ) {
    const sensor = this.sensorsService.getSensorById(sensorId, SystemSession);

    if (!sensor) {
      throw new NotFoundException('Sensor not found');
    }

    if (!(await this.sensorsService.checkUserAccessToSensor(sensorId, user))) {
      throw new ForbiddenException('You do not have access to this sensor');
    }

    return this.scenariosModel.find({ sensorId });
  }

  async createScenario(scenario: CreateScenarioDTO, user: SessionUser) {
    const sensor = this.sensorsService.getSensorById(
      scenario.sensorId,
      SystemSession,
    );

    if (!sensor) {
      throw new NotFoundException('Sensor not found');
    }

    if (
      !(await this.sensorsService.checkUserAccessToSensor(
        scenario.sensorId,
        user,
      ))
    ) {
      throw new ForbiddenException('You do not have access to this sensor');
    }

    const res = this.scenariosModel.create(scenario);

    await this.mqttService.updateSensorsScenarios(scenario.sensorId);

    return res;
  }

  async updateScenario(
    scenarioId: mongoose.Types.ObjectId,
    data: UpdateScenarioDTO,
    user: SessionUser,
  ) {
    const sensor = await this.sensorsService.getSensorById(
      data.sensorId,
      SystemSession,
    );

    if (!sensor) {
      throw new NotFoundException('Sensor not found');
    }

    if (
      !(await this.sensorsService.checkUserAccessToSensor(data.sensorId, user))
    ) {
      throw new ForbiddenException('You do not have access to this sensor');
    }

    const scenario = await this.scenariosModel.findById(scenarioId);

    if (!scenario) {
      throw new NotFoundException('Scenario not found');
    }

    const res = this.scenariosModel.findByIdAndUpdate(scenarioId, data);

    await this.mqttService.updateSensorsScenarios(data.sensorId);

    if (data.sensorId !== scenario.sensorId) {
      await this.mqttService.updateSensorsScenarios(scenario.sensorId);
    }

    return res;
  }

  async deleteScenario(scenarioId: mongoose.Types.ObjectId, user: SessionUser) {
    const scenario = await this.scenariosModel.findById(scenarioId);

    if (!scenario) {
      throw new NotFoundException('Scenario not found');
    }

    if (
      !(await this.sensorsService.checkUserAccessToSensor(
        scenario.sensorId,
        user,
      ))
    ) {
      throw new ForbiddenException('You do not have access to this sensor');
    }

    const res = this.scenariosModel.findByIdAndDelete(scenarioId);

    await this.mqttService.updateSensorsScenarios(scenario.sensorId);

    return res;
  }
}
