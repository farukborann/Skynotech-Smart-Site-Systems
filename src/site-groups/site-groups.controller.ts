import mongoose from 'mongoose';
import { Roles } from 'src/access-control/access-control.decorator';
import { RoleEnum } from 'src/access-control/access-control.enum';
import { AuthGuard } from 'src/auth/auth.guard';
import { ParseObjectIdPipe } from 'src/pipes/ParseObjectIdPipe';

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateSiteGroupDTO } from './site-groups.dto';
import { SiteGroupsService } from './site-groups.service';

@Controller('site-groups')
export class SiteGroupsController {
  constructor(private readonly siteGroupsService: SiteGroupsService) {}

  @Get()
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  async getAllSiteGroups() {
    return await this.siteGroupsService.getAllSiteGroups();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  async getSiteGroupById(
    @Param('id', ParseObjectIdPipe) id: mongoose.Types.ObjectId,
  ) {
    return await this.siteGroupsService.getSiteGroupById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  async createSiteGroup(@Body() siteGroup: CreateSiteGroupDTO) {
    return await this.siteGroupsService.createSiteGroup(siteGroup);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  async updateSiteGroup(
    @Param('id', ParseObjectIdPipe) id: mongoose.Types.ObjectId,
    @Body() siteGroup: CreateSiteGroupDTO,
  ) {
    return await this.siteGroupsService.updateSiteGroup(id, siteGroup);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  async deleteSiteGroup(
    @Param('id', ParseObjectIdPipe) id: mongoose.Types.ObjectId,
    @Req() req,
  ) {
    return await this.siteGroupsService.deleteSiteGroup(id, req.user);
  }
}
