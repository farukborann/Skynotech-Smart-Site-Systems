import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubSystem } from './sub-systems.schema';
import { SitesService } from 'src/sites/sites.service';
import { SessionUser, SystemSession } from 'src/auth/session.interface';
import {
  CreateSubSystemDTO,
  UpdateIgnitionStatusDTO,
  UpdateSubSystemDTO,
} from './sub-systems.dto';
import { MqttService } from 'src/mqtt/mqtt.service';

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

  async checkUserAccessToSubSystem(subSystemId: string, user: SessionUser) {
    const subSystem = await this.subSystemsModel.findById(subSystemId).exec();

    if (!subSystem) return false;

    return this.sitesServices.checkUserAccessToSite(
      subSystem.siteId.toString(),
      user,
    );
  }

  async getAllSubSystems() {
    return await this.subSystemsModel.find({}).exec();
  }

  async getSubSystemById(id: string, user: SessionUser) {
    if (!(await this.checkUserAccessToSubSystem(id, user))) {
      throw new ForbiddenException('User has no access to this sub-system');
    }
    return await this.subSystemsModel.findById(id).exec();
  }

  async getSitesSubSystems(siteId: string, user: SessionUser) {
    if (!(await this.sitesServices.checkUserAccessToSite(siteId, user))) {
      throw new ForbiddenException('User has no access to this site');
    }

    const site = await this.sitesServices.getSiteById(siteId, user);

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

  async updateSubSystem(id: string, data: UpdateSubSystemDTO) {
    // check is topic changed and reconnect for new topic
    return await this.subSystemsModel.findByIdAndUpdate(id, data, {
      new: true,
    });
  }

  async deleteSubSystem(id: string) {
    // disconnect from topic
    return await this.subSystemsModel.findByIdAndDelete(id);
  }

  async updateIgnitionStatus(
    subSystemId: string,
    data: UpdateIgnitionStatusDTO,
    user: SessionUser,
  ) {
    const subSystem = await this.getSubSystemById(subSystemId, SystemSession);

    if (!subSystem) {
      throw new ForbiddenException('SubSystem not found');
    }

    if (
      !(await this.checkUserAccessToSubSystem(subSystem._id.toString(), user))
    ) {
      throw new ForbiddenException('User has no access to this site');
    }

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
