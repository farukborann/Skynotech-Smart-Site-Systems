import mongoose from 'mongoose';
import { Roles } from 'src/access-control/access-control.decorator';
import { RoleEnum } from 'src/access-control/access-control.enum';
import { AuthGuard } from 'src/auth/auth.guard';
import { ParseObjectIdPipe } from 'src/pipes/ParseObjectIdPipe';

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  UseGuards,
  Req,
  Param,
  Body,
} from '@nestjs/common';
import {
  CreateSubSystemDTO,
  UpdateIgnitionStatusDTO,
  UpdateSubSystemDTO,
} from './sub-systems.dto';
import { SubSystemsService } from './sub-systems.service';

@Controller('sub-systems')
export class SubSystemsController {
  constructor(private readonly subSystemsService: SubSystemsService) {}

  @Get()
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  async getAllSubSystems() {
    return await this.subSystemsService.getAllSubSystems();
  }

  @Get('site/:siteId')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.USER)
  async getSitesSubSystems(
    @Param('siteId', ParseObjectIdPipe) siteId: mongoose.Types.ObjectId,
    @Req() req,
  ) {
    return await this.subSystemsService.getSitesSubSystems(siteId, req.user);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.USER)
  async getSubSystemById(
    @Param('id', ParseObjectIdPipe) id: mongoose.Types.ObjectId,
    @Req() req,
  ) {
    return await this.subSystemsService.getSubSystemById(id, req.user);
  }

  @Post()
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  async createSubSystem(@Body() data: CreateSubSystemDTO) {
    return await this.subSystemsService.createSubSystem(data);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  async updateSubSystem(
    @Param('id', ParseObjectIdPipe) id: mongoose.Types.ObjectId,
    @Body() data: UpdateSubSystemDTO,
  ) {
    return await this.subSystemsService.updateSubSystem(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  async deleteSubSystem(
    @Param('id', ParseObjectIdPipe) id: mongoose.Types.ObjectId,
  ) {
    return await this.subSystemsService.deleteSubSystem(id);
  }

  @Post(':id/ignition')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.USER)
  async updateIgnitionStatus(
    @Param('id', ParseObjectIdPipe) id: mongoose.Types.ObjectId,
    @Body() data: UpdateIgnitionStatusDTO,
    @Req() req,
  ) {
    return await this.subSystemsService.updateIgnitionStatus(
      id,
      data,
      req.user,
    );
  }
}
