import mongoose, { Model } from 'mongoose';
import { RoleEnum } from 'src/access-control/access-control.enum';
import { SessionUser } from 'src/auth/session.interface';
import { SitesService } from 'src/sites/sites.service';
import { UsersService } from 'src/users/users.service';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateSiteGroupDTO, UpdateSiteGroupDTO } from './site-groups.dto';
import { SiteGroup } from './site-groups.schema';

@Injectable()
export class SiteGroupsService {
  constructor(
    @InjectModel('SiteGroups')
    private readonly siteGroupModel: Model<SiteGroup>,
    private readonly sitesServices: SitesService,
    private readonly usersServices: UsersService,
  ) {}

  async getAllSiteGroups() {
    return await this.siteGroupModel.find({}).exec();
  }

  async getSiteGroupById(id: mongoose.Types.ObjectId) {
    const siteGroup = await this.siteGroupModel.findById(id).exec();

    if (!siteGroup) {
      throw new NotFoundException('Site Group Not Found');
    }

    return siteGroup;
  }

  async createSiteGroup(siteGroup: CreateSiteGroupDTO) {
    // Check if all sites exist
    for (let i = 0; i < siteGroup.sites.length; i++) {
      const site = await this.siteGroupModel.findById(siteGroup.sites[i]);

      if (!site) {
        throw new NotFoundException('Site not found');
      }
    }

    const siteIds = siteGroup.sites.map(
      (site) => new mongoose.Types.ObjectId(site),
    );

    // Check if all site group admins exist
    for (let i = 0; i < siteGroup.admins.length; i++) {
      const siteGroupAdmin = await this.usersServices.getUserById(
        siteGroup.siteGroupAdmins[i],
      );

      if (!siteGroupAdmin) {
        throw new NotFoundException('Admin not found');
      }
    }

    const siteGroupAdminIds = siteGroup.siteGroupAdmins.map(
      (siteGroupAdmin) => new mongoose.Types.ObjectId(siteGroupAdmin),
    );

    // Check if all admins exist
    for (let i = 0; i < siteGroup.admins.length; i++) {
      const admin = await this.usersServices.getUserById(siteGroup.admins[i]);

      if (!admin) {
        throw new NotFoundException('Admin not found');
      }
    }

    const adminIds = siteGroup.admins.map(
      (admin) => new mongoose.Types.ObjectId(admin),
    );

    // Check if all users exist
    for (let i = 0; i < siteGroup.users.length; i++) {
      const user = await this.usersServices.getUserById(siteGroup.users[i]);

      if (!user) {
        throw new NotFoundException('User not found');
      }
    }

    const userIds = siteGroup.users.map(
      (user) => new mongoose.Types.ObjectId(user),
    );

    return await this.siteGroupModel.create({
      ...siteGroup,
      sites: siteIds,
      admins: adminIds,
      users: userIds,
      siteGroupAdmins: siteGroupAdminIds,
    });
  }

  async updateSiteGroup(
    id: mongoose.Types.ObjectId,
    siteGroup: UpdateSiteGroupDTO,
  ) {
    const _siteGroup = await this.siteGroupModel.findById(id);

    if (!_siteGroup) {
      throw new NotFoundException('Site Group Not Found');
    }

    if (siteGroup.sites) {
      // Check if all sites exist
      for (let i = 0; i < siteGroup.sites.length; i++) {
        const site = await this.siteGroupModel.findById(siteGroup.sites[i]);

        if (!site) {
          throw new NotFoundException('Site not found');
        }
      }

      // Check if site is not in the new site group sites (deleted site from site group)
      for (let i = 0; i < _siteGroup.sites.length; i++) {
        if (!siteGroup.sites.includes(_siteGroup.sites[i])) {
          const site = await this.siteGroupModel.findById(_siteGroup.sites[i]);

          site.admins = [];
          site.users = [];

          await site.save();
        }
      }

      _siteGroup.sites = siteGroup.sites.map(
        (site) => new mongoose.Types.ObjectId(site),
      );
    }

    if (siteGroup.admins) {
      // Check if all admins exist
      for (let i = 0; i < siteGroup.admins.length; i++) {
        const admin = await this.siteGroupModel.findById(siteGroup.admins[i]);

        if (!admin) {
          throw new NotFoundException('Admin not found');
        }
      }

      // Check if admin is not in the new site group admins (deleted admin from site group)
      for (let i = 0; i < _siteGroup.admins.length; i++) {
        if (!siteGroup.admins.includes(_siteGroup.admins[i])) {
          const adminSites = await this.sitesServices.getUsersSites({
            role: RoleEnum.USER,
            _id: _siteGroup.admins[i].toString(),
          } as any);

          for (let j = 0; j < adminSites.length; j++) {
            adminSites[j].admins = adminSites[j].admins.filter(
              (admin) => admin.toString() !== _siteGroup.admins[i].toString(),
            );

            await adminSites[j].save();
          }
        }
      }

      _siteGroup.admins = siteGroup.admins.map(
        (admin) => new mongoose.Types.ObjectId(admin),
      );
    }

    if (siteGroup.users) {
      // Check if all users exist
      for (let i = 0; i < siteGroup.users.length; i++) {
        const user = await this.siteGroupModel.findById(siteGroup.users[i]);

        if (!user) {
          throw new NotFoundException('User not found');
        }
      }

      // Check if user is not in the new site group users (deleted user from site group)
      for (let i = 0; i < _siteGroup.users.length; i++) {
        if (!siteGroup.users.includes(_siteGroup.users[i])) {
          const userSites = await this.sitesServices.getUsersSites({
            role: RoleEnum.USER,
            _id: _siteGroup.users[i].toString(),
          } as any);

          for (let j = 0; j < userSites.length; j++) {
            userSites[j].users = userSites[j].users.filter(
              (user) => user.toString() !== _siteGroup.users[i].toString(),
            );

            await userSites[j].save();
          }
        }
      }

      _siteGroup.users = siteGroup.users.map(
        (user) => new mongoose.Types.ObjectId(user),
      );
    }

    if (siteGroup.name) {
      _siteGroup.name = siteGroup.name;
    }

    return await _siteGroup.save();
  }

  async deleteSiteGroup(id: mongoose.Types.ObjectId, user: SessionUser) {
    const siteGroup = await this.siteGroupModel.findById(id);

    if (!siteGroup) {
      throw new NotFoundException('Site Group Not Found');
    }

    for (let i = 0; i < siteGroup.sites.length; i++) {
      const site = await this.sitesServices.getSiteById(
        siteGroup.sites[i],
        user,
      );

      site.users = [];
      site.admins = [];

      await site.save();
    }

    return await siteGroup.deleteOne();
  }
}
