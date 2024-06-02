import mongoose, { Model } from 'mongoose';
import { SessionUser } from 'src/auth/session.interface';
import { MqttService } from 'src/mqtt/mqtt.service';
import { SensorsService } from 'src/sensors/sensors.service';

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
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

  async checkUserAccessToScenario(
    scenarioId: mongoose.Types.ObjectId,
    user: SessionUser,
  ) {
    const scenario = await this.scenariosModel.findById(scenarioId).exec();

    if (!scenario) {
      throw new NotFoundException('Scenario not found');
    }

    await this.sensorsService.checkUserAccessToSensor(scenario.sensorId, user);

    return scenario;
  }

  async getScenariosBySensorId(
    sensorId: mongoose.Types.ObjectId,
    user: SessionUser,
  ) {
    await this.sensorsService.checkUserAccessToSensor(sensorId, user);

    return this.scenariosModel.find({ sensorId });
  }

  async createScenario(scenario: CreateScenarioDTO, user: SessionUser) {
    await this.sensorsService.checkUserAccessToSensor(scenario.sensorId, user);

    const res = this.scenariosModel.create(scenario);

    await this.mqttService.updateSensorsScenarios(scenario.sensorId);

    return res;
  }

  async updateScenario(
    scenarioId: mongoose.Types.ObjectId,
    data: UpdateScenarioDTO,
    user: SessionUser,
  ) {
    const scenario = await this.checkUserAccessToScenario(scenarioId, user);

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
    const scenario = await this.checkUserAccessToScenario(scenarioId, user);

    await this.mqttService.updateSensorsScenarios(scenario.sensorId);

    return await scenario.deleteOne();
  }
}
