import { Controller, Get, Post, Patch, Delete } from '@nestjs/common';
import { SubSystemsService } from './sub-systems.service';
import { CreateSubSystemDTO, UpdateSubSystemDTO } from './sub-systems.dto';

@Controller('sub-systems')
export class SubSystemsController {
  constructor(private readonly subSystemsService: SubSystemsService) {}

  @Get()
  async getAllSubSystems() {
    return await this.subSystemsService.getAllSubSystems();
  }

  @Get(':id')
  async getSubSystemById(id: string) {
    return await this.subSystemsService.getSubSystemById(id);
  }

  @Post()
  async createSubSystem(data: CreateSubSystemDTO) {
    return await this.subSystemsService.createSubSystem(data);
  }

  @Patch(':id')
  async updateSubSystem(id: string, data: UpdateSubSystemDTO) {
    return await this.subSystemsService.updateSubSystem(id, data);
  }

  @Delete(':id')
  async deleteSubSystem(id: string) {
    return await this.subSystemsService.deleteSubSystem(id);
  }
}
