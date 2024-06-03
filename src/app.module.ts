import mongoose from 'mongoose';
import * as MongooseDelete from 'mongoose-delete';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleEnum } from './access-control/access-control.enum';
import { AccessControlModule } from './access-control/access-control.module';
import { AuthModule } from './auth/auth.module';
import { MqttModule } from './mqtt/mqtt.module';
import { ScenariosModule } from './scenarios/scenarios.module';
import { SensorsModule } from './sensors/sensors.module';
import { SiteGroupsModule } from './site-groups/site-groups.module';
import { SitesModule } from './sites/sites.module';
import { SubSystemsModule } from './sub-systems/sub-systems.module';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';

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
// TODO: Check all endpoints has access control
// TODO: Check all endpoints has update mqtt service
// TODO: Check all delete endpoints has return same object
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
        firstName: 'Super',
        lastName: 'Admin',
        phoneNumber: '',
        role: RoleEnum.SUPER_ADMIN,
      });
    }
  }
}
