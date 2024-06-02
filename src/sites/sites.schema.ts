import mongoose, { Document } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Site extends Document<mongoose.Types.ObjectId> {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  address: string;

  @Prop({ required: true, type: String })
  province: string;

  @Prop({ required: true, type: String })
  district: string;

  @Prop({ required: true, type: String })
  mqttTopic: string;

  @Prop({
    required: true,
    type: [mongoose.Types.ObjectId],
    default: [],
    ref: 'users',
  })
  admins: mongoose.Types.ObjectId[];

  @Prop({
    required: true,
    type: [mongoose.Types.ObjectId],
    default: [],
    ref: 'users',
  })
  users: mongoose.Types.ObjectId[];
}

export const SiteSchema = SchemaFactory.createForClass(Site);
