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
import { SubSystemsService } from './sub-systems.service';
import { CreateSubSystemDTO, UpdateSubSystemDTO } from './sub-systems.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/access-control/access-control.decorator';
import { RoleEnum } from 'src/access-control/access-control.enum';

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
  async getSitesSubSystems(@Param('siteId') siteId: string, @Req() req) {
    return await this.subSystemsService.getSitesSubSystems(siteId, req.user);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.USER)
  async getSubSystemById(@Param('id') id: string) {
    return await this.subSystemsService.getSubSystemById(id);
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
    @Param('id') id: string,
    @Body() data: UpdateSubSystemDTO,
  ) {
    return await this.subSystemsService.updateSubSystem(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  async deleteSubSystem(@Param('id') id: string) {
    return await this.subSystemsService.deleteSubSystem(id);
  }
}
