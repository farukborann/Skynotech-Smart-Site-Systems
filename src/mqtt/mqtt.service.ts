import mongoose from 'mongoose';
import { connect, MqttClient } from 'mqtt';
import { SystemSession } from 'src/auth/session.interface';
import { Scenario } from 'src/scenarios/scenarios.schema';
import { ScenariosService } from 'src/scenarios/scenarios.service';
import { areNowBetweenTimeIntervals } from 'src/scenarios/scenarios.utils';
import { Sensor } from 'src/sensors/sensors.schema';
import { SensorsService } from 'src/sensors/sensors.service';
import { Site } from 'src/sites/sites.schema';
import { SitesService } from 'src/sites/sites.service';
import { SubSystem } from 'src/sub-systems/sub-systems.schema';
import { SubSystemsService } from 'src/sub-systems/sub-systems.service';

import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MqttService {
  client: MqttClient | null = null;

  // topic -> sensorId
  private topicSensors: { [key: string]: string } = {};

  // sensorId -> topic
  private sensorTopics: { [key: string]: string } = {};

  // sensorId -> lastValue
  private lastValues: { [key: string]: { value: string; timestamp: Date } } =
    {};

  // sensorId -> scenario[]
  private sensorScenarios: { [key: string]: Scenario[] } = {};

  // subSystemId -> scenario[] (no condition scenarios)
  private subSystemsScenarios: { [key: string]: Scenario[] } = {};

  readonly MQTT_OPTIONS = {
    host: 'skynotech-0u674v.a01.euc1.aws.hivemq.cloud',
    port: 8883, // TLS port
    username: 'yeqq99',
    password: 'd2BfvrT4T9pg.8P',
    connectTimeout: 10000, // Bağlantı süresi 10 saniye olarak ayarlandı
  };

  readonly IGNITION_TOPIC = 'kontaklar';
  readonly SENSORS_TOPIC = 'sensörler';
  readonly IGNITION_JSON_KEY = 'kontakDurum';

  private getTopicForSensor(site: Site, subSystem: SubSystem, sensor: Sensor) {
    return `${site.mqttTopic}/${this.SENSORS_TOPIC}/${subSystem.mqttTopic}/${sensor.mqttTopic}`;
  }

  private getTopicForIgnitions(site: Site, subSystem: SubSystem) {
    return `${site.mqttTopic}/${this.IGNITION_TOPIC}/${subSystem.mqttTopic}`;
  }

  constructor(
    @Inject(forwardRef(() => SitesService))
    private readonly sitesService: SitesService,
    @Inject(forwardRef(() => SubSystemsService))
    private readonly subSystemsService: SubSystemsService,
    @Inject(forwardRef(() => SensorsService))
    private readonly sensorsService: SensorsService,
    @Inject(forwardRef(() => ScenariosService))
    private readonly scenariosService: ScenariosService,
  ) {
    setTimeout(() => {
      this.initMQTT();
    }, 1000);
  }

  initMQTT() {
    this.client = connect(`mqtts://${this.MQTT_OPTIONS.host}`, {
      port: this.MQTT_OPTIONS.port,
      username: this.MQTT_OPTIONS.username,
      password: this.MQTT_OPTIONS.password,
      connectTimeout: this.MQTT_OPTIONS.connectTimeout,
    });

    this.client.on('connect', async () => {
      Logger.warn('Connected to MQTT broker');
      const sites = await this.sitesService.getAllSites();
      for (const site of sites) {
        await this.subscribeForSite(site._id);
      }

      setInterval(() => {
        this.processSubSystemScenarios();
      }, 60000);

      Logger.log('Started processing scenarios for subSystems on every minute');
    });

    this.client.on('error', (error) => {
      Logger.error('MQTT error:', error);
    });

    this.client.on('message', (topic, message) => {
      if (!this.topicSensors[topic]) {
        return;
      }

      const sensorId = new mongoose.Types.ObjectId(this.topicSensors[topic]);

      this.lastValues[sensorId.toString()] = {
        value: message.toString(),
        timestamp: new Date(),
      };

      this.processSensorValueForScenario(sensorId, message.toString());
    });

    this.client.on('close', () => {
      Logger.log('MQTT connection closed');
    });

    this.client.on('reconnect', () => {
      Logger.log('MQTT reconnecting');
    });

    this.client.on('end', () => {
      Logger.log('MQTT connection ended');
    });
  }

  // Subscription functions
  async unsubscribeForSensor(sensorId: mongoose.Types.ObjectId) {
    const subscriptionKey = this.sensorTopics[sensorId.toString()];

    this.client?.unsubscribe(subscriptionKey);

    if (this.lastValues[subscriptionKey]) {
      delete this.lastValues[subscriptionKey];
    }

    delete this.sensorTopics[sensorId.toString()];
    delete this.topicSensors[subscriptionKey];

    Logger.log(`Unsubscribed from ${subscriptionKey} (Sensor)`);
  }

  async unsubscribeForSubSystem(subSystemId: mongoose.Types.ObjectId) {
    const sensors = await this.sensorsService.getSensorsBySubSystemId(
      subSystemId,
      SystemSession,
    );

    for (const sensor of sensors) {
      await this.unsubscribeForSensor(sensor._id);
    }

    Logger.log(`Unsubscribed from ${subSystemId} (SubSystem)`);
  }

  async unsubscribeForSite(siteId: mongoose.Types.ObjectId) {
    const subSystems = await this.subSystemsService.getSitesSubSystems(
      siteId,
      SystemSession,
    );

    for (const subSystem of subSystems) {
      await this.unsubscribeForSubSystem(subSystem._id);
    }

    Logger.log(`Unsubscribed from ${siteId} (Site)`);
  }

  async subscribeForSensor(sensorId: mongoose.Types.ObjectId) {
    const sensor = await this.sensorsService.getSensorById(
      sensorId,
      SystemSession,
    );

    const subSystem = await this.subSystemsService.getSubSystemById(
      sensor.subSystemId,
      SystemSession,
    );

    const site = await this.sitesService.getSiteById(
      subSystem.siteId,
      SystemSession,
    );

    const subscriptionKey = this.getTopicForSensor(site, subSystem, sensor);

    this.client?.subscribe(subscriptionKey);

    this.topicSensors[subscriptionKey] = sensorId.toString();
    this.sensorTopics[sensorId.toString()] = subscriptionKey;

    await this.updateSensorsScenarios(sensorId);

    Logger.log(`Subscribed to ${subscriptionKey} (Sensor)`);
  }

  async subscribeForSubSystem(subSystemId: mongoose.Types.ObjectId) {
    const subSystem = await this.subSystemsService.getSubSystemById(
      subSystemId,
      SystemSession,
    );

    const sensors = await this.sensorsService.getSensorsBySubSystemId(
      subSystem._id,
      SystemSession,
    );

    for (const sensor of sensors) {
      await this.subscribeForSensor(sensor._id);
    }

    await this.updateSubSystemsScenarios(subSystemId);

    Logger.log(`Subscribed to ${subSystemId} (SubSystem)`);
  }

  async subscribeForSite(siteId: mongoose.Types.ObjectId) {
    const subSystems = await this.subSystemsService.getSitesSubSystems(
      siteId,
      SystemSession,
    );

    for (const subSystem of subSystems) {
      await this.subscribeForSubSystem(subSystem._id);
    }

    Logger.log(`Subscribed to ${siteId} (Site)`);
  }

  // Ignition functions
  async updateIgnitionStatus(
    subSystemId: mongoose.Types.ObjectId,
    ignitionStatuses: object,
  ) {
    const subSystem = await this.subSystemsService.getSubSystemById(
      subSystemId,
      SystemSession,
    );

    const site = await this.sitesService.getSiteById(
      subSystem.siteId,
      SystemSession,
    );

    const ignitionSubscriptionKey = this.getTopicForIgnitions(site, subSystem);
    const data = JSON.stringify({ [this.IGNITION_JSON_KEY]: ignitionStatuses });

    this.client?.publish(ignitionSubscriptionKey, data);
  }

  // Scenario functions
  async updateSensorsScenarios(sensorId: mongoose.Types.ObjectId) {
    const scenarios = await this.scenariosService.getScenariosBySensorId(
      sensorId,
      SystemSession,
    );

    this.sensorScenarios[sensorId.toString()] = scenarios.map((scenario) =>
      scenario.toObject(),
    );

    Logger.log(
      `Updated scenarios for sensor ${sensorId} (${scenarios.length} scenarios)`,
    );
  }

  async deleteSensorsScenarios(sensorId: mongoose.Types.ObjectId) {
    if (this.sensorScenarios[sensorId.toString()]) {
      delete this.sensorScenarios[sensorId.toString()];
    }

    Logger.log(`Deleted scenarios for sensor ${sensorId}`);
  }

  async processSensorValueForScenario(
    sensorId: mongoose.Types.ObjectId,
    value: string,
  ) {
    if (!this.sensorScenarios[sensorId.toString()]) {
      return;
    }

    const valueNumber = parseFloat(value);

    if (isNaN(valueNumber)) {
      Logger.error(`Value ${value} is not a number for sensor ${sensorId}`);
      return;
    }

    const activeScenarios = this.sensorScenarios[sensorId.toString()].filter(
      (scenario) =>
        areNowBetweenTimeIntervals(scenario.startDate, scenario.endDate),
    );

    for (const scenario of activeScenarios) {
      if (valueNumber < scenario.min) {
        const newIgnitionStatus: { [key: string]: number } = {};

        Object.keys(scenario.ignitions).forEach((ignitionIndex) => {
          newIgnitionStatus[ignitionIndex] = 0;
        });

        await this.updateIgnitionStatus(
          scenario.subSystemId,
          newIgnitionStatus,
        );

        Logger.log(
          `Value ${value} is less than ${scenario.min} for sensor ${sensorId} and scenario ${scenario._id}`,
        );
      } else if (valueNumber > scenario.max) {
        await this.updateIgnitionStatus(
          scenario.subSystemId,
          scenario.ignitions,
        );

        Logger.log(
          `Value ${value} is greater than ${scenario.max} for sensor ${sensorId} and scenario ${scenario._id}`,
        );
      } else {
        Logger.log(
          `Value ${value} is between ${scenario.min} and ${scenario.max} for sensor ${sensorId} and scenario ${scenario._id}`,
        );
      }
    }
  }

  async updateSubSystemsScenarios(subSystemId: mongoose.Types.ObjectId) {
    // Get only scenarios without sensor
    const scenarios = (
      await this.scenariosService.getScenariosBySubSystemId(
        subSystemId,
        SystemSession,
      )
    ).filter((scenario) => !scenario.sensorId);

    this.subSystemsScenarios[subSystemId.toString()] = scenarios.map(
      (scenario) => scenario.toObject(),
    );

    Logger.log(
      `Updated scenarios for subSystem ${subSystemId} (${scenarios.length} scenarios)`,
    );
  }

  async deleteSubSystemsScenarios(subSystemId: mongoose.Types.ObjectId) {
    if (this.subSystemsScenarios[subSystemId.toString()]) {
      delete this.subSystemsScenarios[subSystemId.toString()];
    }

    Logger.log(`Deleted scenarios for subSystem ${subSystemId}`);
  }

  async processSubSystemScenarios() {
    for (const subSystemId in this.subSystemsScenarios) {
      if (!this.subSystemsScenarios[subSystemId.toString()]) {
        return;
      }

      const activeScenarios = this.subSystemsScenarios[
        subSystemId.toString()
      ].filter((scenario) =>
        areNowBetweenTimeIntervals(scenario.startDate, scenario.endDate),
      );

      for (const scenario of activeScenarios) {
        await this.updateIgnitionStatus(
          scenario.subSystemId,
          scenario.ignitions,
        );
      }
    }
  }

  // Sensor functions
  async getSensorsLastValue(sensorId: mongoose.Types.ObjectId) {
    return (
      this.lastValues[sensorId.toString()] ?? {
        value: '-',
        timestamp: new Date(),
      }
    );
  }
}
