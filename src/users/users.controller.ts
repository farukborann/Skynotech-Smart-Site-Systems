import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService as _UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { LocalAuthGuard } from 'src/auth/local/local.auth.guard';
import { CreateUserDTO } from './users.dto';
import { Roles } from 'src/access-control/access-control.decorator';
import { RoleEnum } from 'src/access-control/access-control.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly UsersService: _UsersService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(@Request() req) {
    return { ...req.user.toObject(), password: undefined };
  }

  @Get('/logout')
  logout(@Request() req) {
    req.session.destroy();
    return { message: 'The user session has ended' };
  }

  @UseGuards(AuthGuard)
  @Get('/profile')
  test(@Request() req) {
    return { ...req.user, password: undefined };
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  @Post()
  async createUser(@Body() data: CreateUserDTO) {
    return await this.UsersService.createUser(data);
  }
}
