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
import { CreateScenarioDTO, UpdateScenarioDTO } from './scenarios.dto';
import { ScenariosService } from './scenarios.service';

@Controller('scenarios')
export class ScenariosController {
  constructor(private readonly scenariosService: ScenariosService) {}

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.USER)
  @Get(':sensorId')
  async getScenariosBySensorId(
    @Param('sensorId', ParseObjectIdPipe) sensorId: mongoose.Types.ObjectId,
    @Req() req,
  ) {
    return this.scenariosService.getScenariosBySensorId(sensorId, req.user);
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.USER)
  @Get()
  async getUsersScenarios(@Req() req) {
    return this.scenariosService.getUsersScenarios(req.user);
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.USER)
  @Post()
  async createScenario(@Body() data: CreateScenarioDTO, @Req() req) {
    return this.scenariosService.createScenario(data, req.user);
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.USER)
  @Patch(':id')
  async updateScenario(
    @Param('id', ParseObjectIdPipe) id: mongoose.Types.ObjectId,
    @Body() data: UpdateScenarioDTO,
    @Req() req,
  ) {
    return this.scenariosService.updateScenario(id, data, req.user);
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.USER)
  @Delete(':id')
  async deleteScenario(
    @Param('id', ParseObjectIdPipe) id: mongoose.Types.ObjectId,
    @Req() req,
  ) {
    return this.scenariosService.deleteScenario(id, req.user);
  }
}
