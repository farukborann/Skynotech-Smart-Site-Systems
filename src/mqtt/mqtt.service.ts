import { Injectable } from '@nestjs/common';
import { connect, MqttClient } from 'mqtt';
import { RoleEnum } from 'src/access-control/access-control.enum';
import { SitesService } from 'src/sites/sites.service';
import { SubSystemsService } from 'src/sub-systems/sub-systems.service';

@Injectable()
export class MqttService {
  client: MqttClient | null = null;

  readonly MQTT_OPTIONS = {
    host: 'skynotech-0u674v.a01.euc1.aws.hivemq.cloud',
    port: 8883, // TLS port
    username: 'yeqq99',
    password: 'd2BfvrT4T9pg.8P',
    connectTimeout: 10000, // Bağlantı süresi 60 saniye olarak ayarlandı
  };

  constructor(
    private readonly sitesService: SitesService,
    private readonly subSystemsService: SubSystemsService,
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
        await this.subsucibeForSite(site._id.toString());
      }
    });

    this.client.on('error', (error) => {
      console.error('MQTT error:', error);
    });

    this.client.on('message', (topic, message) => {
      console.log(`Topic: ${topic}, Message: ${message.toString()}`);
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

  async subsucribeForSubSystem(subSystemId: string) {
    const subSystem =
      await this.subSystemsService.getSubSystemById(subSystemId);

    const site = await this.sitesService.getSiteById(
      subSystem.siteId.toString(),
      {
        role: RoleEnum.SUPER_ADMIN,
      } as any,
    );

    this.client?.subscribe(`${site.mqttTopic}/${subSystem.mqttTopic}`);
    console.log(`Subscribed to ${subSystem.mqttTopic}`);
  }

  async subsucibeForSite(siteId: string) {
    const site = await this.sitesService.getSiteById(siteId, {
      role: RoleEnum.SUPER_ADMIN,
    } as any);

    const subSystems = await this.subSystemsService.getSitesSubSystems(siteId, {
      role: RoleEnum.SUPER_ADMIN,
    } as any);

    subSystems.forEach((subSystem) => {
      this.client?.subscribe(`${site.mqttTopic}/${subSystem.mqttTopic}`);
      console.log(`Subscribed to ${site.mqttTopic}/${subSystem.mqttTopic}`);
    });
  }
}
