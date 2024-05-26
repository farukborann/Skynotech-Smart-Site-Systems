import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubSystem } from './sub-systems.schema';
import { SitesService } from 'src/sites/sites.service';
import { SessionUser } from 'src/auth/session.interface';
import { CreateSubSystemDTO, UpdateSubSystemDTO } from './sub-systems.dto';

@Injectable()
export class SubSystemsService {
  constructor(
    @InjectModel('SubSystems')
    private readonly subSystemsModel: Model<SubSystem>,
    private readonly sitesServices: SitesService,
  ) {}

  async getAllSubSystems() {
    return await this.subSystemsModel.find({}).exec();
  }

  async getSubSystemById(id: string) {
    return await this.subSystemsModel.findById(id).exec();
  }

  async getSitesSubSystems(siteId: string, user: SessionUser) {
    const site = await this.sitesServices.getSiteById(siteId, user);

    return await this.subSystemsModel.find({ siteId: site._id }).exec();
  }

  async createSubSystem(data: CreateSubSystemDTO) {
    // connect to topic
    return await new this.subSystemsModel(data).save();
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
