import { Injectable } from '@nestjs/common';
import { CreateSiteDTO, UpdateSiteDTO } from './sites.dto';
import { Site } from './sites.schema';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SessionUser } from 'src/auth/session.interface';

@Injectable()
export class SitesService {
  constructor(@InjectModel('Sites') private siteModel: Model<Site>) {}

  async createSite(data: CreateSiteDTO) {
    const userIds = data.users.map((x) => new mongoose.Types.ObjectId(x));

    return await this.siteModel.create({ ...data, users: userIds });
  }

  async getAllSites(user: SessionUser) {
    if (user.role === 'SUPER_ADMIN')
      return await this.siteModel.find({}).exec();

    return await this.siteModel.find({ users: { $in: user._id } }).exec();
  }

  async getSiteById(id: string, user: SessionUser) {
    const site = await this.siteModel.findById(id).exec();

    if (
      user.role !== 'SUPER_ADMIN' ||
      !site.users.includes(new mongoose.Types.ObjectId(user._id))
    )
      throw new Error('User has no access to this site');

    return site;
  }

  async updateSite(id: string, data: UpdateSiteDTO) {
    return await this.siteModel.findByIdAndUpdate(id, data, { new: true });
  }
}
