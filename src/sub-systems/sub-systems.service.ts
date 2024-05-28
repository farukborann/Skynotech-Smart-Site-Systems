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
import { CreateSubSystemDTO, UpdateSubSystemDTO } from './sub-systems.dto';

@Injectable()
export class SubSystemsService {
  constructor(
    @InjectModel('SubSystems')
    private readonly subSystemsModel: Model<SubSystem>,
    @Inject(forwardRef(() => SitesService))
    private readonly sitesServices: SitesService,
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

  async getSubSystemById(id: string) {
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

    for (let i = 0; i < data.ignitionCount; i++) {
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
}
