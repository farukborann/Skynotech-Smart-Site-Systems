import mongoose, { Model } from 'mongoose';
import { RoleEnum } from 'src/access-control/access-control.enum';
import { SessionUser } from 'src/auth/session.interface';
import { MqttService } from 'src/mqtt/mqtt.service';

import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateSiteDTO, UpdateSiteDTO } from './sites.dto';
import { Site } from './sites.schema';

@Injectable()
export class SitesService {
  constructor(
    @InjectModel('Sites') private siteModel: Model<Site>,
    @Inject(forwardRef(() => MqttService))
    private readonly mqttService: MqttService,
  ) {}

  async checkUserAccessToSite(
    siteId: mongoose.Types.ObjectId,
    user: SessionUser,
  ) {
    const site = await this.siteModel.findById(siteId).exec();

    if (!site) throw new NotFoundException('Site not found');

    if (
      user.role !== RoleEnum.SUPER_ADMIN &&
      !site.admins.includes(new mongoose.Types.ObjectId(user._id)) &&
      !site.users.includes(new mongoose.Types.ObjectId(user._id))
    )
      throw new ForbiddenException('User has no access to this site');

    return site;
  }

  async getAllSites() {
    return await this.siteModel.find({}).exec();
  }

  async getUsersSites(user: SessionUser) {
    if (user.role === RoleEnum.SUPER_ADMIN)
      return await this.siteModel.find({}).exec();

    return await this.siteModel.find({ users: { $in: user._id } }).exec();
  }

  async getSiteById(id: mongoose.Types.ObjectId, user: SessionUser) {
    return await this.checkUserAccessToSite(id, user);
  }

  async createSite(data: CreateSiteDTO) {
    const adminsIds = data.admins.map((x) => new mongoose.Types.ObjectId(x));

    for (const adminId of adminsIds) {
      const admin = await this.siteModel.findById(adminId).exec();

      if (!admin) throw new NotFoundException('Admin not found');
    }

    const userIds = data.users.map((x) => new mongoose.Types.ObjectId(x));

    for (const userId of userIds) {
      const user = await this.siteModel.findById(userId).exec();

      if (!user) throw new NotFoundException('User not found');
    }

    return await this.siteModel.create({
      ...data,
      users: userIds,
      admins: adminsIds,
    });
  }

  async updateSite(id: mongoose.Types.ObjectId, data: UpdateSiteDTO) {
    const site = await this.siteModel.findById(id).exec();

    if (data.admins) {
      const newAdminsIds = data.admins.map(
        (x) => new mongoose.Types.ObjectId(x),
      );

      for (const adminId of newAdminsIds) {
        const admin = await this.siteModel.findById(adminId).exec();

        if (!admin) throw new NotFoundException('Admin not found');
      }

      site.admins = newAdminsIds;
    }

    if (data.users) {
      const newUserIds = data.users.map((x) => new mongoose.Types.ObjectId(x));

      for (const userId of newUserIds) {
        const user = await this.siteModel.findById(userId).exec();

        if (!user) throw new NotFoundException('User not found');
      }

      site.users = newUserIds;
    }

    if (data.name) site.name = data.name;
    if (data.address) site.address = data.address;
    if (data.province) site.province = data.province;
    if (data.district) site.district = data.district;

    if (data.mqttTopic && site.mqttTopic !== data.mqttTopic) {
      site.mqttTopic = data.mqttTopic;
      await site.save();

      await this.mqttService.unsubscribeForSite(site._id);
      await this.mqttService.subscribeForSite(site._id);
    }

    return await site.save();
  }

  async deleteSite(id: mongoose.Types.ObjectId) {
    const site = await this.siteModel.findById(id).exec();

    if (!site) throw new NotFoundException('Site not found');

    await this.mqttService.unsubscribeForSite(site._id);

    // TODO: delete all sub-systems and sensors of this site.
    // TODO: delete all references to this site in site-groups collection.

    return await site.deleteOne();
  }
}
