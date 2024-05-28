import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSiteDTO, UpdateSiteDTO } from './sites.dto';
import { Site } from './sites.schema';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SessionUser } from 'src/auth/session.interface';
import { RoleEnum } from 'src/access-control/access-control.enum';
import { MqttService } from 'src/mqtt/mqtt.service';

@Injectable()
export class SitesService {
  constructor(
    @InjectModel('Sites') private siteModel: Model<Site>,
    @Inject(forwardRef(() => MqttService))
    private readonly mqttService: MqttService,
  ) {}

  async checkUserAccessToSite(siteId: string, user: SessionUser) {
    const site = await this.siteModel.findById(siteId).exec();

    if (!site) return false;

    if (
      user.role !== RoleEnum.SUPER_ADMIN &&
      !site.admins.includes(new mongoose.Types.ObjectId(user._id)) &&
      !site.users.includes(new mongoose.Types.ObjectId(user._id))
    )
      return false;

    return true;
  }

  async getAllSites() {
    return await this.siteModel.find({}).exec();
  }

  async getUsersSites(user: SessionUser) {
    if (user.role === RoleEnum.SUPER_ADMIN)
      return await this.siteModel.find({}).exec();

    return await this.siteModel.find({ users: { $in: user._id } }).exec();
  }

  async getSiteById(id: string, user: SessionUser) {
    if (!(await this.checkUserAccessToSite(id, user)))
      throw new ForbiddenException('User has no access to this site');

    const site = await this.siteModel.findById(id).exec();

    return site;
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

  async updateSite(id: string, data: UpdateSiteDTO) {
    const site = await this.siteModel.findById(id).exec();

    const newAdminsIds = data.admins.map((x) => new mongoose.Types.ObjectId(x));

    for (const adminId of newAdminsIds) {
      const admin = await this.siteModel.findById(adminId).exec();

      if (!admin) throw new NotFoundException('Admin not found');
    }

    const newUserIds = data.users.map((x) => new mongoose.Types.ObjectId(x));

    for (const userId of newUserIds) {
      const user = await this.siteModel.findById(userId).exec();

      if (!user) throw new NotFoundException('User not found');
    }

    site.name = data.name;
    site.admins = newAdminsIds;
    site.users = newUserIds;
    site.address = data.address;
    site.province = data.province;
    site.district = data.district;
    site.mqttTopic = data.mqttTopic;

    const res = await site.save();

    if (site.mqttTopic !== data.mqttTopic) {
      await this.mqttService.unsubscribeForSite(site._id.toString());
      await this.mqttService.subscribeForSite(data.mqttTopic);
    }

    return res;
  }
}
