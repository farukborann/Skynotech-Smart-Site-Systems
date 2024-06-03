import * as bcrypt from 'bcrypt';
import mongoose, { Model } from 'mongoose';
import { RoleEnum } from 'src/access-control/access-control.enum';
import { SessionUser } from 'src/auth/session.interface';
import { SitesService } from 'src/sites/sites.service';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CreateUserDTO,
  UpdateUserDTO,
  UpdatePrivacySettingsDTO,
  GetExternalUserDTO,
} from './users.dto';
import { User } from './users.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('users') private readonly UserModel: Model<User>,
    private readonly sitesService: SitesService,
  ) {}

  async getUserByEmail(email: string) {
    return await this.UserModel.findOne({ email });
  }

  async getUserById(id: mongoose.Types.ObjectId) {
    return await this.UserModel.findById(id);
  }

  async getSuperAdmins() {
    return await this.UserModel.find({ role: RoleEnum.SUPER_ADMIN });
  }

  async createUser(data: CreateUserDTO) {
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltOrRounds);

    const user = await this.UserModel.create({
      ...data,
      password: hashedPassword,
    });

    return { ...user.toObject(), password: undefined };
  }

  async updateUser(
    id: mongoose.Types.ObjectId,
    data: UpdateUserDTO,
    reqUser: SessionUser,
  ) {
    if (
      reqUser.role !== RoleEnum.SUPER_ADMIN &&
      reqUser._id !== id.toString()
    ) {
      throw new NotFoundException(
        'You do not have permission to update this user',
      );
    }

    const user = await this.UserModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (data.password) {
      const saltOrRounds = 10;
      data.password = await bcrypt.hash(data.password, saltOrRounds);
    }

    Object.assign(user, data);
    await user.save();

    return {
      ...user.toObject(),
      password: undefined,
      privacySettings: undefined,
    };
  }

  async updatePrivacySettings(
    data: UpdatePrivacySettingsDTO,
    reqUser: SessionUser,
  ) {
    const user = await this.UserModel.findById(reqUser._id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, { privacySettings: data });
    await user.save();

    return {
      ...user.toObject(),
      password: undefined,
    };
  }

  async deleteUser(id: mongoose.Types.ObjectId, reqUser: SessionUser) {
    if (
      reqUser.role !== RoleEnum.SUPER_ADMIN &&
      reqUser._id !== id.toString()
    ) {
      throw new NotFoundException(
        'You do not have permission to delete this user',
      );
    }

    const user = await this.UserModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await user.deleteOne();
    return { message: 'User deleted successfully' };
  }

  async getExternalUser(data: GetExternalUserDTO, reqUser: SessionUser) {
    const site = await this.sitesService.getSiteById(data.siteId, reqUser);

    if (!site) {
      throw new NotFoundException('Site not found');
    }

    if (
      !site.users.includes(data.userId) ||
      !site.admins.includes(data.userId)
    ) {
      throw new NotFoundException('User not found');
    }

    const user = await this.UserModel.findById(data.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.privacySettings;
    delete userObj.role;

    if (user.privacySettings?.showEmail === false) {
      userObj.email = undefined;
    }

    if (user.privacySettings?.showPhoneNumber === false) {
      userObj.phoneNumber = undefined;
    }

    if (user.privacySettings?.showProfilePhoto === false) {
      userObj.profilePhoto = '';
    }

    return userObj;
  }
}
