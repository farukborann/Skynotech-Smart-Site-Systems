import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SitesService } from './sites.service';
import { CreateSiteDTO } from './sites.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/access-control/access-control.decorator';
import { RoleEnum } from 'src/access-control/access-control.enum';

@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  @Get()
  async getAllSites() {
    return await this.sitesService.getAllSites();
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.USER)
  @Get(':id')
  async getSiteById(@Param('id') id: string) {
    return await this.sitesService.getSiteById(id);
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  @Post()
  async insertSite(@Body() data: CreateSiteDTO) {
    return await this.sitesService.insertSite(data);
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  @Post(':id')
  async updateSite(@Param('id') id: string, @Body() data: CreateSiteDTO) {
    return await this.sitesService.updateSite(id, data);
  }
}
