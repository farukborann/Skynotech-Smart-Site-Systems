import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './users.schema';
import { CreateUserDTO } from './users.dto';
import * as bcrypt from 'bcrypt';
import { RoleEnum } from 'src/access-control/access-control.enum';

@Injectable()
export class UsersService {
  constructor(@InjectModel('users') private readonly UserModel: Model<User>) {}

  async createUser(data: CreateUserDTO) {
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltOrRounds);

    const user = await this.UserModel.create({
      ...data,
      password: hashedPassword,
    });
    delete user.password;

    return user;
  }

  async getUserByEmail(email: string) {
    return await this.UserModel.findOne({ email });
  }

  async getUserById(id: string) {
    return await this.UserModel.findById(id);
  }

  async getSuperAdmins() {
    return await this.UserModel.find({ role: RoleEnum.SUPER_ADMIN });
  }
}
