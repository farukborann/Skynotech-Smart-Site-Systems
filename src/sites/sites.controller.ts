import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SitesService } from './sites.service';
import { CreateSiteDTO, UpdateSiteDTO } from './sites.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/access-control/access-control.decorator';
import { RoleEnum } from 'src/access-control/access-control.enum';

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
  async getSiteById(@Param('id') id: string, @Req() req) {
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
  async updateSite(@Param('id') id: string, @Body() data: UpdateSiteDTO) {
    return await this.sitesService.updateSite(id, data);
  }
}
