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
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateSensorDTO, UpdateSensorDTO } from './sensors.dto';
import { SensorsService } from './sensors.service';

@Controller('sensors')
export class SensorsController {
  constructor(private readonly sensorsService: SensorsService) {}

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  @Get()
  async getAllSensors() {
    return await this.sensorsService.getAllSensors();
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  @Post()
  async createSensor(@Body() sensor: CreateSensorDTO) {
    return await this.sensorsService.createSensor(sensor);
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  @Patch(':id')
  async updateSensor(
    @Param('id', ParseObjectIdPipe) id: mongoose.Types.ObjectId,
    @Body() sensor: UpdateSensorDTO,
  ) {
    return await this.sensorsService.updateSensor(id, sensor);
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  @Delete(':id')
  async deleteSensor(
    @Param('id', ParseObjectIdPipe) id: mongoose.Types.ObjectId,
  ) {
    return await this.sensorsService.deleteSensor(id);
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.USER)
  @Get(':id')
  async getSensorById(
    @Param('id', ParseObjectIdPipe) id: mongoose.Types.ObjectId,
    @Req() req,
  ) {
    return await this.sensorsService.getSensorById(id, req.user);
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.USER)
  @Get('sub-system/:subSystemId')
  async getSensorsBySubSystemId(
    @Param('subSystemId', ParseObjectIdPipe)
    subSystemId: mongoose.Types.ObjectId,
    @Req() req,
  ) {
    return await this.sensorsService.getSensorsBySubSystemId(
      subSystemId,
      req.user,
    );
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.USER)
  @Get('value/:id')
  async getSensorValueById(
    @Param('id', ParseObjectIdPipe) id: mongoose.Types.ObjectId,
    @Req() req,
  ) {
    return await this.sensorsService.getSensorValueById(id, req.user);
  }
}
