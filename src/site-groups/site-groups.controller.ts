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
import { CreateSiteGroupDTO, UpdateSiteGroupDTO } from './site-groups.dto';
import { SiteGroupsService } from './site-groups.service';

@Controller('site-groups')
export class SiteGroupsController {
  constructor(private readonly siteGroupsService: SiteGroupsService) {}

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  @Get()
  async getAllSiteGroups() {
    return await this.siteGroupsService.getAllSiteGroups();
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  @Get(':id')
  async getSiteGroupById(
    @Param('id', ParseObjectIdPipe) id: mongoose.Types.ObjectId,
  ) {
    return await this.siteGroupsService.getSiteGroupById(id);
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  @Patch(':id')
  async updateSiteGroup(
    @Param('id', ParseObjectIdPipe) id: mongoose.Types.ObjectId,
    @Body() siteGroup: UpdateSiteGroupDTO,
  ) {
    return await this.siteGroupsService.updateSiteGroup(id, siteGroup);
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  @Post()
  async createSiteGroup(@Body() siteGroup: CreateSiteGroupDTO) {
    return await this.siteGroupsService.createSiteGroup(siteGroup);
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  @Delete(':id')
  async deleteSiteGroup(
    @Param('id', ParseObjectIdPipe) id: mongoose.Types.ObjectId,
    @Req() req,
  ) {
    return await this.siteGroupsService.deleteSiteGroup(id, req.user);
  }
}
