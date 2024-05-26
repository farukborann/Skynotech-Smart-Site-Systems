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
import { SiteGroupsService } from './site-groups.service';
import { CreateSiteGroupDTO } from './site-groups.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/access-control/access-control.decorator';
import { RoleEnum } from 'src/access-control/access-control.enum';

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
  async getSiteGroupById(@Param('id') id: string) {
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
    @Param('id') id: string,
    @Body() siteGroup: CreateSiteGroupDTO,
  ) {
    return await this.siteGroupsService.updateSiteGroup(id, siteGroup);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  async deleteSiteGroup(@Req() req, @Param('id') id: string) {
    return await this.siteGroupsService.deleteSiteGroup(id, req.user);
  }
}
