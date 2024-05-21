import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './users.schema';
import { AccessControlService } from 'src/access-control/access-control.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'users', schema: UserSchema }])],
  providers: [UsersService, AccessControlService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
