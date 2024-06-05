import mongoose, { Model } from 'mongoose';
import { SessionUser } from 'src/auth/session.interface';
import { MqttService } from 'src/mqtt/mqtt.service';
import { areTimeIntervalsOverlapping } from 'src/scenarios/scenarios.utils';
import { SensorsService } from 'src/sensors/sensors.service';
import { SitesService } from 'src/sites/sites.service';
import { SubSystemsService } from 'src/sub-systems/sub-systems.service';

import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
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

    await this.subSystemsService.checkUserAccessToSubSystem(
      scenario.subSystemId,
      user,
    );

    return scenario;
  }

  async getScenariosBySensorId(
    sensorId: mongoose.Types.ObjectId,
    user: SessionUser,
  ) {
    await this.sensorsService.checkUserAccessToSensor(sensorId, user);

    return await this.scenariosModel.find({ sensorId });
  }

  async getScenariosBySubSystemId(
    subSystemId: mongoose.Types.ObjectId,
    user: SessionUser,
  ) {
    await this.subSystemsService.checkUserAccessToSubSystem(subSystemId, user);

    return await this.scenariosModel.find({ subSystemId });
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
        const subSystemsScenarios = await this.getScenariosBySubSystemId(
          subSystem._id,
          user,
        );

        scenarios.push(
          ...subSystemsScenarios.map((scenario) => ({
            scenario,
            subSystem,
            site,
          })),
        );
      }
    }

    return scenarios;
  }

  async createScenario(data: CreateScenarioDTO, user: SessionUser) {
    if (data.min && data.max && data.min > data.max) {
      throw new BadRequestException('Min değeri max değerinden büyük olamaz.');
    }

    if (data.sensorId) {
      const sensor = await this.sensorsService.checkUserAccessToSensor(
        data.sensorId,
        user,
      );

      if (sensor.subSystemId.toString() !== data.subSystemId.toString()) {
        throw new BadRequestException(
          'Sensor does not belong to this subSystem',
        );
      }
    }

    const subSystem = await this.subSystemsService.getSubSystemById(
      data.subSystemId,
      user,
    );

    if (Object.keys(data.ignitions).length !== subSystem.ignitionCount) {
      throw new BadRequestException(
        'Ignition count does not match with the subSystem',
      );
    }

    const ignitionKeys = Array.from(
      { length: subSystem.ignitionCount },
      (_, i) => (i + 1).toString(),
    );

    for (const key of ignitionKeys) {
      if (key in data.ignitions === false) {
        throw new BadRequestException('Ignition values are missing');
      }
    }

    // check is scenario hours are empty
    const scenarios = await this.scenariosModel
      .find({
        subSystemId: data.subSystemId,
      })
      .exec();

    for (const scenario of scenarios) {
      if (
        areTimeIntervalsOverlapping(
          scenario.startDate,
          scenario.endDate,
          new Date(data.startDate),
          new Date(data.endDate),
        )
      ) {
        throw new BadRequestException(
          'Bu saatler arasında başka bir senaryo var.',
        );
      }
    }

    const _ignitions: { [key: string]: 1 | 0 } = {};
    for (let i = 1; i <= subSystem.ignitionCount; i++) {
      _ignitions[i.toString()] = data.ignitions[i - 1];
    }

    const res = await this.scenariosModel.create({
      ...data,
      ignitions: _ignitions,
    });

    if (data.sensorId) {
      await this.mqttService.updateSensorsScenarios(data.sensorId);
    } else {
      await this.mqttService.updateSubSystemsScenarios(data.subSystemId);
    }

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

    if (data.min && data.max && data.min > data.max) {
      throw new BadRequestException('Min değeri max değerinden büyük olamaz.');
    }

    if (data.sensorId) {
      const sensor = await this.sensorsService.getSensorById(
        data.sensorId,
        user,
      );

      if (!sensor) {
        throw new NotFoundException('Sensor not found');
      }

      if (sensor.subSystemId !== scenario.subSystemId) {
        throw new BadRequestException(
          'Sensor does not belong to this subSystem',
        );
      }
    }

    const subSystem = await this.subSystemsService.getSubSystemById(
      data.subSystemId,
      user,
    );

    if (Object.keys(data.ignitions).length !== subSystem.ignitionCount) {
      throw new BadRequestException(
        'Ignition count does not match with the subSystem',
      );
    }

    const ignitionKeys = Array.from(
      { length: subSystem.ignitionCount },
      (_, i) => (i + 1).toString(),
    );

    for (const key of ignitionKeys) {
      if (!data.ignitions[key]) {
        throw new BadRequestException('Ignition values are missing');
      }
    }

    // check is scenario hours are empty
    const scenarios = await this.scenariosModel
      .find({
        subSystemId: data.subSystemId,
      })
      .exec();

    for (const scenario of scenarios) {
      if (scenario._id.equals(scenarioId)) {
        continue;
      }

      if (
        areTimeIntervalsOverlapping(
          scenario.startDate,
          scenario.endDate,
          new Date(data.startDate),
          new Date(data.endDate),
        )
      ) {
        throw new BadRequestException(
          'Bu saatler arasında başka bir senaryo var.',
        );
      }
    }

    const _ignitions: { [key: string]: number } = {};
    for (let i = 1; i <= subSystem.ignitionCount; i++) {
      _ignitions[i.toString()] = data.ignitions[i - 1];
    }

    const res = await this.scenariosModel.findByIdAndUpdate(scenarioId, {
      ...data,
      ignitions: _ignitions,
    });

    if (data.sensorId && data.sensorId !== scenario.sensorId) {
      await this.mqttService.updateSensorsScenarios(scenario.sensorId);
    } else {
      await this.mqttService.updateSubSystemsScenarios(scenario.subSystemId);
    }

    return res;
  }

  async deleteScenario(scenarioId: mongoose.Types.ObjectId, user: SessionUser) {
    const scenario = await this.checkUserAccessToScenario(scenarioId, user);

    const res = await scenario.deleteOne();

    if (scenario.sensorId)
      await this.mqttService.updateSensorsScenarios(scenario.sensorId);
    else await this.mqttService.updateSubSystemsScenarios(scenario.subSystemId);

    return res;
  }
}
