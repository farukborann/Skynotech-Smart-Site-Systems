// import * as bcrypt from 'bcrypt';
import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { UsersService as _UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { LocalAuthGuard } from 'src/auth/local/local.auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly UsersService: _UsersService) {}

  // @Post('/register')
  // async register(
  //   @Body('email') email: string,
  //   @Body('password') password: string,
  // ) {
  //   const saltOrRounds = 10;
  //   const hashedPassword = await bcrypt.hash(password, saltOrRounds);
  //   const result = await this.UsersService.insertUser(email, hashedPassword);
  //   return {
  //     msg: 'User successfully registered',
  //     userId: result.id,
  //     email: result.email,
  //   };
  // }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(@Request() req): any {
    return { User: req.user, msg: 'User logged in' };
  }

  @Get('/logout')
  logout(@Request() req): any {
    req.session.destroy();
    return { msg: 'The user session has ended' };
  }

  @UseGuards(AuthGuard)
  @Get('/test')
  test(@Request() req): string {
    return req.user;
  }
}
