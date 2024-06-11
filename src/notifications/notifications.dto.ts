import { IsEnum, IsString } from 'class-validator';
import mongoose from 'mongoose';
import { IsMongoId } from 'src/decorators/IsMongoId';

import { NotificationTypeEnum } from './notifications.enums';

export class CreateNotificationDTO {
  @IsEnum(NotificationTypeEnum)
  type: NotificationTypeEnum;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsMongoId()
  siteId: mongoose.Types.ObjectId;
}
