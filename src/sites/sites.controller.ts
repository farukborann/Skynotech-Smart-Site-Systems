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
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateSiteDTO, UpdateSiteDTO } from './sites.dto';
import { SitesService } from './sites.service';

@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.USER)
  @Get()
  async getUsersSites(@Req() req) {
    return await this.sitesService.getUsersSites(req.user);
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.USER)
  @Get(':id')
  async getSiteById(
    @Param('id', ParseObjectIdPipe) id: mongoose.Types.ObjectId,
    @Req() req,
  ) {
    return await this.sitesService.getSiteById(id, req.user);
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  @Post()
  async createSite(@Body() data: CreateSiteDTO) {
    return await this.sitesService.createSite(data);
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  @Post(':id')
  async updateSite(
    @Param('id', ParseObjectIdPipe) id: mongoose.Types.ObjectId,
    @Body() data: UpdateSiteDTO,
  ) {
    return await this.sitesService.updateSite(id, data);
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  @Delete(':id')
  async deleteSite(
    @Param('id', ParseObjectIdPipe) id: mongoose.Types.ObjectId,
  ) {
    return await this.sitesService.deleteSite(id);
  }
}
