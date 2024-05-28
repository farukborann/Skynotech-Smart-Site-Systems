import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { connect, MqttClient } from 'mqtt';
import { SystemSession } from 'src/auth/session.interface';
import { Sensor } from 'src/sensors/sensors.schema';
import { SensorsService } from 'src/sensors/sensors.service';
import { Site } from 'src/sites/sites.schema';
import { SitesService } from 'src/sites/sites.service';
import { SubSystem } from 'src/sub-systems/sub-systems.schema';
import { SubSystemsService } from 'src/sub-systems/sub-systems.service';

@Injectable()
export class MqttService {
  client: MqttClient | null = null;

  // topic -> sensorId
  private topicSensors: { [key: string]: string } = {};

  // sensorId -> lastValue
  private lastValues: { [key: string]: string } = {};

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
    private readonly subSystemsService: SubSystemsService,
    private readonly sensorsService: SensorsService,
  ) {
    this.client = connect(`mqtts://${this.MQTT_OPTIONS.host}`, {
      port: this.MQTT_OPTIONS.port,
      username: this.MQTT_OPTIONS.username,
      password: this.MQTT_OPTIONS.password,
      connectTimeout: this.MQTT_OPTIONS.connectTimeout,
    });

    this.client.on('connect', async () => {
      console.log('Connected to MQTT broker');

      const sites = await this.sitesService.getAllSites();

      for (const site of sites) {
        await this.subscribeForSite(site._id.toString());
      }
    });

    this.client.on('error', (error) => {
      console.error('MQTT error:', error);
    });

    this.client.on('message', (topic, message) => {
      const sensorId = this.topicSensors[topic];

      this.lastValues[sensorId] = message.toString();
    });

    this.client.on('close', () => {
      console.log('MQTT connection closed');
    });

    this.client.on('reconnect', () => {
      console.log('MQTT reconnecting');
    });

    this.client.on('end', () => {
      console.log('MQTT connection ended');
    });
  }

  async unsubscribeForSensor(sensorId: string) {
    const subscriptionKey = this.topicSensors[sensorId];

    this.client?.unsubscribe(subscriptionKey);

    if (this.lastValues[subscriptionKey]) {
      delete this.lastValues[subscriptionKey];
    }

    delete this.topicSensors[sensorId];
  }

  async unsubscribeForSubSystem(subSystemId: string) {
    const sensors = await this.sensorsService.getSensorsBySubSystemId(
      subSystemId,
      SystemSession,
    );

    for (const sensor of sensors) {
      await this.unsubscribeForSensor(sensor._id.toString());
    }
  }

  async unsubscribeForSite(siteId: string) {
    const subSystems = await this.subSystemsService.getSitesSubSystems(
      siteId,
      SystemSession,
    );

    for (const subSystem of subSystems) {
      await this.unsubscribeForSubSystem(subSystem._id.toString());
    }
  }

  async subscribeForSensor(sensorId: string) {
    const sensor = await this.sensorsService.getSensorById(
      sensorId,
      SystemSession,
    );

    const subSystem = await this.subSystemsService.getSubSystemById(
      sensor.subSystemId.toString(),
      SystemSession,
    );

    const site = await this.sitesService.getSiteById(
      subSystem.siteId.toString(),
      SystemSession,
    );

    const subscriptionKey = this.getTopicForSensor(site, subSystem, sensor);

    this.client?.subscribe(subscriptionKey);

    this.topicSensors[subscriptionKey] = sensorId;

    console.log(`Subscribed to ${subscriptionKey} (Sensor)`);
  }

  async subscribeForSubSystem(subSystemId: string) {
    const subSystem = await this.subSystemsService.getSubSystemById(
      subSystemId,
      SystemSession,
    );

    const sensors = await this.sensorsService.getSensorsBySubSystemId(
      subSystem._id.toString(),
      SystemSession,
    );

    for (const sensor of sensors) {
      await this.subscribeForSensor(sensor._id.toString());
    }

    console.log(`Subscribed to ${subSystemId} (SubSystem)`);
  }

  async subscribeForSite(siteId: string) {
    const subSystems = await this.subSystemsService.getSitesSubSystems(
      siteId,
      SystemSession,
    );

    for (const subSystem of subSystems) {
      await this.subscribeForSubSystem(subSystem._id.toString());
    }

    console.log(`Subscribed to ${siteId} (Site)`);
  }

  async updateIgnitionStatus(subSystemId: string, ignitionStatuses: object) {
    const subSystem = await this.subSystemsService.getSubSystemById(
      subSystemId,
      SystemSession,
    );

    const site = await this.sitesService.getSiteById(
      subSystem.siteId.toString(),
      SystemSession,
    );

    const ignitionSubscriptionKey = this.getTopicForIgnitions(site, subSystem);
    const data = JSON.stringify({ [this.IGNITION_JSON_KEY]: ignitionStatuses });

    this.client?.publish(ignitionSubscriptionKey, data);
  }
}
