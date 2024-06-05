import mongoose, { Document } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SystemTypeArray, SystemTypeType } from './sub-systems.enum';

@Schema({ timestamps: true })
export class SubSystem extends Document<mongoose.Types.ObjectId> {
  @Prop({
    required: true,
    enum: SystemTypeArray,
  })
  systemType: SystemTypeType;

  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: 'sites' })
  siteId: mongoose.Types.ObjectId;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  mqttTopic: string;

  @Prop({ required: true, type: Number })
  ignitionCount: number;

  @Prop({ required: true, type: Object })
  lastIgnitionStatuses: { [key: string]: 1 | 0 };
}

export const SubSystemSchema = SchemaFactory.createForClass(SubSystem);
