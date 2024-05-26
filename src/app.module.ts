import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as MongooseDelete from 'mongoose-delete';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SitesModule } from './sites/sites.module';
import { SensorsModule } from './sensors/sensors.module';
import { ScenariosModule } from './scenarios/scenarios.module';
import { SubSystemsModule } from './sub-systems/sub-systems.module';
import { AccessControlModule } from './access-control/access-control.module';
import { UsersService } from './users/users.service';
import { SiteGroupsModule } from './site-groups/site-groups.module';
import mongoose from 'mongoose';
import { RoleEnum } from './access-control/access-control.enum';
import { MqttModule } from './mqtt/mqtt.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_CONNECTION_STRING, {
      connectionFactory: (connection) => {
        connection.plugin(MongooseDelete, {
          deletedAt: true,
          overrideMethods: true,
        });
        return connection;
      },
    }),
    UsersModule,
    SitesModule,
    SubSystemsModule,
    SensorsModule,
    ScenariosModule,
    AuthModule,
    AccessControlModule,
    SiteGroupsModule,
    MqttModule,
  ],
})
export class AppModule {
  constructor(private readonly usersService: UsersService) {}

  async onModuleInit() {
    // Update string checkRequired method to check if the value is a string for allow empty strings
    mongoose.Schema.Types.String.checkRequired((v) => typeof v === 'string');

    const superAdmins = await this.usersService.getSuperAdmins();

    if (!superAdmins.length) {
      console.log('No super admins found, creating default super admin');

      await this.usersService.createUser({
        email: 'iam@superadmin.com',
        password: 'superadminpass123',
        phoneNumber: '',
        role: RoleEnum.SUPER_ADMIN,
      });
    }
  }
}
