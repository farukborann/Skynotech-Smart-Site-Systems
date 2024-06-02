import mongoose from 'mongoose';
import { Roles } from 'src/access-control/access-control.decorator';
import { RoleEnum } from 'src/access-control/access-control.enum';
import { AuthGuard } from 'src/auth/auth.guard';
import { LocalAuthGuard } from 'src/auth/local/local.auth.guard';
import { ParseObjectIdPipe } from 'src/pipes/ParseObjectIdPipe';

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  CreateUserDTO,
  UpdatePrivacySettingsDTO,
  UpdateUserDTO,
} from './users.dto';
import { UsersService as _UsersService } from './users.service';

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

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.USER)
  @Patch(':id')
  async updateUser(
    @Param('id', ParseObjectIdPipe) id: mongoose.Types.ObjectId,
    @Body() data: UpdateUserDTO,
    @Request() req,
  ) {
    return await this.UsersService.updateUser(id, data, req.user);
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.USER)
  @Post('/privacy-settings')
  async updatePrivacySettings(
    @Body() data: UpdatePrivacySettingsDTO,
    @Request() req,
  ) {
    return await this.UsersService.updatePrivacySettings(data, req.user);
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.USER)
  @Delete(':id')
  async deleteUser(
    @Param('id', ParseObjectIdPipe) id: mongoose.Types.ObjectId,
    @Request() req,
  ) {
    return await this.UsersService.deleteUser(id, req.user);
  }
}
