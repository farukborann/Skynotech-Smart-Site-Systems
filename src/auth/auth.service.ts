import * as bcrypt from 'bcrypt';
import { UsersService as _UsersService } from 'src/users/users.service';

import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private readonly UsersService: _UsersService) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.UsersService.getUserByEmail(email);

    if (!user) {
      throw new NotAcceptableException('Could not find the user');
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (user && passwordValid) {
      delete user.password;

      return user;
    }

    throw new BadRequestException('Password is incorrect');
  }
}
