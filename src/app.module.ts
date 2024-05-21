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
  ],
})
export class AppModule {
  constructor(private readonly _UsersService: UsersService) {}

  async onModuleInit() {
    const asd = await this._UsersService.getUser('admin@admin.com');
    console.log(asd);
    console.log('AppModule initialized');
  }
}
