import { UsersModule } from 'src/users/users.module';

import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';

@Module({
  imports: [UsersModule],
  providers: [],
  controllers: [UploadController],
  exports: [],
})
export class UploadModule {}
