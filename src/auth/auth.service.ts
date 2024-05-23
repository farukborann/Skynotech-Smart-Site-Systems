import { Injectable, NotAcceptableException } from '@nestjs/common';
import { UsersService as _UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly UsersService: _UsersService) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.UsersService.getUserByEmail(email);
    const passwordValid = await bcrypt.compare(password, user.password);

    if (!user) {
      throw new NotAcceptableException('could not find the user');
    }

    if (user && passwordValid) {
      delete user.password;

      return user;
    }

    return null;
  }
}
