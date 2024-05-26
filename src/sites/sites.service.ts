import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateSiteDTO, UpdateSiteDTO } from './sites.dto';
import { Site } from './sites.schema';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SessionUser } from 'src/auth/session.interface';
import { RoleEnum } from 'src/access-control/access-control.enum';

@Injectable()
export class SitesService {
  constructor(@InjectModel('Sites') private siteModel: Model<Site>) {}

  async getAllSites() {
    return await this.siteModel.find({}).exec();
  }

  async createSite(data: CreateSiteDTO) {
    const userIds = data.users.map((x) => new mongoose.Types.ObjectId(x));

    return await this.siteModel.create({ ...data, users: userIds });
  }

  async getUsersSites(user: SessionUser) {
    if (user.role === RoleEnum.SUPER_ADMIN)
      return await this.siteModel.find({}).exec();

    return await this.siteModel.find({ users: { $in: user._id } }).exec();
  }

  async getSiteById(id: string, user: SessionUser) {
    const site = await this.siteModel.findById(id).exec();

    if (
      user.role !== RoleEnum.SUPER_ADMIN &&
      !site.admins.includes(new mongoose.Types.ObjectId(user._id)) &&
      !site.users.includes(new mongoose.Types.ObjectId(user._id))
    )
      throw new ForbiddenException('User has no access to this site');

    return site;
  }

  async updateSite(id: string, data: UpdateSiteDTO) {
    return await this.siteModel.findByIdAndUpdate(id, data, { new: true });
  }
}
