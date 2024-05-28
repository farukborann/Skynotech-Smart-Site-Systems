import { forwardRef, Module } from '@nestjs/common';
import { SubSystemsController } from './sub-systems.controller';
import { SubSystemsService } from './sub-systems.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SubSystemSchema } from './sub-systems.schema';
import { SitesModule } from 'src/sites/sites.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'SubSystems', schema: SubSystemSchema },
    ]),
    forwardRef(() => SitesModule),
  ],
  controllers: [SubSystemsController],
  providers: [SubSystemsService],
  exports: [SubSystemsService],
})
export class SubSystemsModule {}
