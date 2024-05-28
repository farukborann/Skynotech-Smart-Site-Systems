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

  // siteId -> subSystemId -> sensorId = subscriptionKey
  // private subscriptions: { [key: string]: object } = {};

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

  readonly IGNITION_TOPIC = 'ignitions';

  private getSubscriptionKeyForSensor(
    site: Site,
    subSystem: SubSystem,
    sensor: Sensor,
  ) {
    return `${site.mqttTopic}/${subSystem.mqttTopic}/${sensor.mqttTopic}`;
  }

  private getSubscriptionKeyForIgnitions(site: Site, subSystem: SubSystem) {
    return `${site.mqttTopic}/${subSystem.mqttTopic}/${this.IGNITION_TOPIC}`;
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

  async unsubscribeForSensor(
    siteId: string,
    subSystemId: string,
    sensorId: string,
  ) {
    // if (
    //   this.subscriptions[siteId] &&
    //   this.subscriptions[siteId][subSystemId] &&
    //   this.subscriptions[siteId][subSystemId][sensorId]
    // ) {
    //   this.client?.unsubscribe(
    //     this.subscriptions[siteId][subSystemId][sensorId],
    //   );

    //   const topic = this.subscriptions[siteId][subSystemId][sensorId];

    //   if (this.lastValues[topic]) {
    //     delete this.lastValues[topic];
    //   }

    //   delete this.subscriptions[siteId][subSystemId][sensorId];

    //   console.log(
    //     `Unsubscribed from ${this.subscriptions[siteId][subSystemId][sensorId]} (Sensor)`,
    //   );
    // }

    const subscriptionKey = this.topicSensors[sensorId];

    this.client?.unsubscribe(subscriptionKey);

    if (this.lastValues[subscriptionKey]) {
      delete this.lastValues[subscriptionKey];
    }

    delete this.topicSensors[sensorId];
  }

  async unsubscribeForSubSystem(siteId: string, subSystemId: string) {
    // if (this.subscriptions[siteId] && this.subscriptions[siteId][subSystemId]) {
    //   for (const sensorId in this.subscriptions[siteId][subSystemId]) {
    //     await this.unsubscribeForSensor(siteId, subSystemId, sensorId);
    //   }

    // this.client?.unsubscribe(
    //   this.subscriptions[siteId][subSystemId][this.IGNITION_TOPIC],
    // );

    // delete this.subscriptions[siteId][subSystemId][this.IGNITION_TOPIC];

    // console.log(
    //   `Unsubscribed from ${this.subscriptions[siteId][subSystemId][this.IGNITION_TOPIC]} (Ignition)`,
    // );

    //   delete this.subscriptions[siteId][subSystemId];

    //   console.log(`Unsubscribed from ${subSystemId} (SubSystem)`);
    // }

    const sensors = await this.sensorsService.getSensorsBySubSystemId(
      subSystemId,
      SystemSession,
    );

    for (const sensor of sensors) {
      await this.unsubscribeForSensor(
        siteId,
        subSystemId,
        sensor._id.toString(),
      );
    }
  }

  async unsubscribeForSite(siteId: string) {
    // if (this.subscriptions[siteId]) {
    //   for (const subSystemId in this.subscriptions[siteId]) {
    //     await this.unsubscribeForSubSystem(siteId, subSystemId);
    //   }

    //   delete this.subscriptions[siteId];

    //   console.log(`Unsubscribed from ${siteId} (Site)`);
    // }

    const subSystems = await this.subSystemsService.getSitesSubSystems(
      siteId,
      SystemSession,
    );

    for (const subSystem of subSystems) {
      await this.unsubscribeForSubSystem(siteId, subSystem._id.toString());
    }
  }

  async subscribeForSensor(
    siteId: string,
    subSystemId: string,
    sensorId: string,
  ) {
    const site = await this.sitesService.getSiteById(siteId, SystemSession);

    const subSystem =
      await this.subSystemsService.getSubSystemById(subSystemId);

    const sensor = await this.sensorsService.getSensorById(
      sensorId,
      SystemSession,
    );

    const subscriptionKey = this.getSubscriptionKeyForSensor(
      site,
      subSystem,
      sensor,
    );

    this.client?.subscribe(subscriptionKey);

    // if (!this.subscriptions[site._id.toString()]) {
    //   this.subscriptions[site._id.toString()] = {};
    // }

    // if (!this.subscriptions[site._id.toString()][subSystem._id.toString()]) {
    //   this.subscriptions[site._id.toString()][subSystem._id.toString()] = {};
    // }

    // this.subscriptions[site._id.toString()][subSystem._id.toString()][
    //   sensor._id.toString()
    // ] = subscriptionKey;

    this.topicSensors[subscriptionKey] = sensorId;

    console.log(`Subscribed to ${subscriptionKey} (Sensor)`);
  }

  async subscribeForSubSystem(siteId: string, subSystemId: string) {
    // const site = await this.sitesService.getSiteById(siteId, SystemSession);

    const subSystem =
      await this.subSystemsService.getSubSystemById(subSystemId);

    const sensors = await this.sensorsService.getSensorsBySubSystemId(
      subSystem._id.toString(),
      SystemSession,
    );

    // if (!this.subscriptions[site._id.toString()]) {
    //   this.subscriptions[site._id.toString()] = {};
    // }

    // if (!this.subscriptions[site._id.toString()][subSystem._id.toString()]) {
    //   this.subscriptions[site._id.toString()][subSystem._id.toString()] = {};
    // }

    for (const sensor of sensors) {
      await this.subscribeForSensor(siteId, subSystemId, sensor._id.toString());
    }

    // const ignitionSubscriptionKey = this.getSubscriptionKeyForIgnitions(
    //   site,
    //   subSystem,
    // );

    // this.client?.subscribe(ignitionSubscriptionKey);

    // this.subscriptions[site._id.toString()][subSystem._id.toString()][
    //   this.IGNITION_TOPIC
    // ] = ignitionSubscriptionKey;

    // console.log(`Subscribed to ${ignitionSubscriptionKey} (Ignition)`);
    console.log(`Subscribed to ${subSystemId} (SubSystem)`);
  }

  async subscribeForSite(siteId: string) {
    const subSystems = await this.subSystemsService.getSitesSubSystems(
      siteId,
      SystemSession,
    );

    for (const subSystem of subSystems) {
      await this.subscribeForSubSystem(siteId, subSystem._id.toString());
    }

    console.log(`Subscribed to ${siteId} (Site)`);
  }

  async updateIgnitionStatus(
    siteId: string,
    subSystemId: string,
    ignitionStatuses: object,
  ) {
    const site = await this.sitesService.getSiteById(siteId, SystemSession);

    const subSystem =
      await this.subSystemsService.getSubSystemById(subSystemId);

    const ignitionSubscriptionKey = this.getSubscriptionKeyForIgnitions(
      site,
      subSystem,
    );

    this.client?.publish(
      ignitionSubscriptionKey,
      JSON.stringify(ignitionStatuses),
    );

    console.log(
      `Published to ${ignitionSubscriptionKey} (Ignition) => ${JSON.stringify(ignitionStatuses)}`,
    );
  }
}
