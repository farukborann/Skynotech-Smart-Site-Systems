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
import { SensorsService } from './sensors.service';
import { CreateSensorDTO } from './sensors.dto';
import { Roles } from 'src/access-control/access-control.decorator';
import { RoleEnum } from 'src/access-control/access-control.enum';
import { AuthGuard } from 'src/auth/auth.guard';

// update subsubriptions for mqtt topics on create, update, delete
@Controller('sensors')
export class SensorsController {
  constructor(private readonly sensorsService: SensorsService) {}

  @Get()
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  async getAllSensors() {
    return this.sensorsService.getAllSensors();
  }

  @Post()
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  async createSensor(@Body() sensor: CreateSensorDTO) {
    return this.sensorsService.createSensor(sensor);
  }

  @Patch()
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  async updateSensor(@Param('id') id: string, @Body() sensor: CreateSensorDTO) {
    return this.sensorsService.updateSensor(id, sensor);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  async deleteSensor(@Param('id') id: string) {
    return this.sensorsService.deleteSensor(id);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.USER)
  async getSensorById(@Param('id') id: string, @Req() req) {
    return this.sensorsService.getSensorById(id, req.user);
  }

  @Get('sub-system/:subSystemId')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.USER)
  async getSensorsBySubSystemId(
    @Param('subSystemId') subSystemId: string,
    @Req() req,
  ) {
    return this.sensorsService.getSensorsBySubSystemId(subSystemId, req.user);
  }
}
