import mongoose, { Model } from 'mongoose';
import { SessionUser } from 'src/auth/session.interface';
import { MqttService } from 'src/mqtt/mqtt.service';
import { SensorsService } from 'src/sensors/sensors.service';
import { SitesService } from 'src/sites/sites.service';
import { SubSystemsService } from 'src/sub-systems/sub-systems.service';

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateScenarioDTO, UpdateScenarioDTO } from './scenarios.dto';
import { Scenario } from './scenarios.schema';

@Injectable()
export class ScenariosService {
  constructor(
    @InjectModel('Scenarios') private readonly scenariosModel: Model<Scenario>,
    @Inject(forwardRef(() => SitesService))
    private readonly sitesService: SitesService,
    @Inject(forwardRef(() => SubSystemsService))
    private readonly subSystemsService: SubSystemsService,
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

    return await this.scenariosModel.find({ sensorId });
  }

  async getUsersScenarios(user: SessionUser) {
    const scenarios = [];

    const sites = await this.sitesService.getUsersSites(user);

    for (const site of sites) {
      const subSystems = await this.subSystemsService.getSitesSubSystems(
        site._id,
        user,
      );

      for (const subSystem of subSystems) {
        const sensors = await this.sensorsService.getSensorsBySubSystemId(
          subSystem._id,
          user,
        );

        for (const sensor of sensors) {
          const sensorScenarios = await this.getScenariosBySensorId(
            sensor._id,
            user,
          );

          scenarios.push(
            ...sensorScenarios.map((scenario) => ({
              scenario,
              sensor,
              subSystem,
              site,
            })),
          );
        }
      }
    }

    return scenarios;
  }

  async createScenario(scenario: CreateScenarioDTO, user: SessionUser) {
    await this.sensorsService.checkUserAccessToSensor(scenario.sensorId, user);

    const res = await this.scenariosModel.create(scenario);

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

    const res = await this.scenariosModel.findByIdAndUpdate(scenarioId, data);

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
