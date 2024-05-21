import { Module } from '@nestjs/common';
import { SubSystemsController } from './sub-systems.controller';
import { SubSystemsService } from './sub-systems.service';

@Module({
  controllers: [SubSystemsController],
  providers: [SubSystemsService],
})
export class SubSystemsModule {}
