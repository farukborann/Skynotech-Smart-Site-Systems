import { Module } from '@nestjs/common';
import { SiteGroupsController } from './site-groups.controller';
import { SiteGroupsService } from './site-groups.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SiteGroupSchema } from './site-groups.schema';
import { SitesModule } from 'src/sites/sites.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'SiteGroups', schema: SiteGroupSchema },
    ]),
    SitesModule,
    UsersModule,
  ],
  controllers: [SiteGroupsController],
  providers: [SiteGroupsService],
})
export class SiteGroupsModule {}
