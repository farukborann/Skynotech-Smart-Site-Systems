import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { UsersService as _UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { LocalAuthGuard } from 'src/auth/local/local.auth.guard';

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
    return { msg: 'The user session has ended' };
  }

  @UseGuards(AuthGuard)
  @Get('/test')
  test(@Request() req) {
    return req.user;
  }
}
