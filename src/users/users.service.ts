import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './users.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel('users') private readonly UserModel: Model<User>) {}

  async insertUser(email: string, password: string) {
    return this.UserModel.create({
      email,
      password,
    });
  }

  async getUser(email: string) {
    return await this.UserModel.findOne({ email });
  }
}
