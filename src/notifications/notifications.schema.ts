import mongoose, { Document } from 'mongoose';
import {
  NotificationTypeArray,
  NotificationTypeEnum,
} from 'src/notifications/notifications.enums';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Notification extends Document<mongoose.Types.ObjectId> {
  @Prop({
    required: true,
    type: NotificationTypeArray,
  })
  type: NotificationTypeEnum;

  @Prop({
    required: true,
    type: String,
  })
  title: string;

  @Prop({
    required: true,
    type: String,
  })
  message: string;

  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: 'sites' })
  siteId: mongoose.Types.ObjectId;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
