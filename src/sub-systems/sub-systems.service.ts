import mongoose, { Model } from 'mongoose';
import { SessionUser, SystemSession } from 'src/auth/session.interface';
import { MqttService } from 'src/mqtt/mqtt.service';
import { SitesService } from 'src/sites/sites.service';

import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CreateSubSystemDTO,
  UpdateIgnitionStatusDTO,
  UpdateSubSystemDTO,
} from './sub-systems.dto';
import { SubSystem } from './sub-systems.schema';

@Injectable()
export class SubSystemsService {
  constructor(
    @InjectModel('SubSystems')
    private readonly subSystemsModel: Model<SubSystem>,
    @Inject(forwardRef(() => SitesService))
    private readonly sitesServices: SitesService,
    @Inject(forwardRef(() => MqttService))
    private readonly mqttService: MqttService,
  ) {}

  async checkUserAccessToSubSystem(
    subSystemId: mongoose.Types.ObjectId,
    user: SessionUser,
  ) {
    const subSystem = await this.subSystemsModel.findById(subSystemId).exec();

    if (!subSystem) throw new NotFoundException('SubSystem not found');

    await this.sitesServices.checkUserAccessToSite(subSystem.siteId, user);

    return subSystem;
  }

  async getAllSubSystems() {
    return await this.subSystemsModel.find({}).exec();
  }

  async getSubSystemById(id: mongoose.Types.ObjectId, user: SessionUser) {
    return await this.checkUserAccessToSubSystem(id, user);
  }

  async getSitesSubSystems(siteId: mongoose.Types.ObjectId, user: SessionUser) {
    const site = await this.sitesServices.checkUserAccessToSite(siteId, user);

    return await this.subSystemsModel.find({ siteId: site._id }).exec();
  }

  async createSubSystem(data: CreateSubSystemDTO) {
    const site = await this.sitesServices.getSiteById(
      data.siteId,
      SystemSession,
    );

    if (!site) {
      throw new ForbiddenException('Site not found');
    }

    const initialIgnitionStatuses = {};

    for (let i = 1; i <= data.ignitionCount; i++) {
      initialIgnitionStatuses[`${i}`] = 0;
    }

    const subSystem = {
      ...data,
      siteId: site._id,
      lastIgnitionStatuses: initialIgnitionStatuses,
    };

    return await this.subSystemsModel.create(subSystem);
  }

  async updateSubSystem(id: mongoose.Types.ObjectId, data: UpdateSubSystemDTO) {
    const subSystem = await this.subSystemsModel.findById(id).exec();

    if (!subSystem) {
      throw new ForbiddenException('SubSystem not found');
    }

    let reconnect2Mqtt = false;

    if (data.siteId && data.siteId.toString() !== subSystem.siteId.toString()) {
      const newSite = await this.sitesServices.getSiteById(
        data.siteId,
        SystemSession,
      );

      if (!newSite) {
        throw new ForbiddenException('Site not found');
      }

      subSystem.siteId = new mongoose.Types.ObjectId(data.siteId);
      reconnect2Mqtt = true;
    }

    if (data.mqttTopic && data.mqttTopic !== subSystem.mqttTopic) {
      subSystem.mqttTopic = data.mqttTopic;
      reconnect2Mqtt = true;
    }

    if (reconnect2Mqtt) {
      await subSystem.save();
      await this.mqttService.unsubscribeForSubSystem(subSystem._id);
      await this.mqttService.subscribeForSubSystem(subSystem._id);
    }

    if (data.ignitionCount && data.ignitionCount !== subSystem.ignitionCount) {
      const newIgnitionStatuses = {};

      for (let i = 1; i <= data.ignitionCount; i++) {
        newIgnitionStatuses[`${i}`] =
          subSystem.lastIgnitionStatuses[`${i}`] || 0;
      }

      subSystem.lastIgnitionStatuses = newIgnitionStatuses;

      await this.mqttService.updateIgnitionStatus(id, newIgnitionStatuses);
    }

    return await subSystem.save();
  }

  async deleteSubSystem(id: mongoose.Types.ObjectId) {
    await this.mqttService.unsubscribeForSubSystem(id);
    return await this.subSystemsModel.findByIdAndDelete(id);
  }

  async updateIgnitionStatus(
    subSystemId: mongoose.Types.ObjectId,
    data: UpdateIgnitionStatusDTO,
    user: SessionUser,
  ) {
    const subSystem = await this.getSubSystemById(subSystemId, SystemSession);

    if (!subSystem) {
      throw new ForbiddenException('SubSystem not found');
    }

    await this.checkUserAccessToSubSystem(subSystem._id, user);

    const lastIgnitionStatuses = subSystem.lastIgnitionStatuses;

    lastIgnitionStatuses[`${data.ignitionIndex}`] = data.status ? 1 : 0;

    await this.mqttService.updateIgnitionStatus(
      subSystemId,
      lastIgnitionStatuses,
    );

    return await this.subSystemsModel.findByIdAndUpdate(subSystemId, {
      lastIgnitionStatuses,
    });
  }
}
