import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { SystemTypeArray, SystemTypeType } from './sub-systems.enum';

@Schema({ timestamps: true })
export class SubSystem extends Document {
  @Prop({
    required: true,
    enum: SystemTypeArray,
  })
  systemType: SystemTypeType;

  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: 'sites' })
  siteId: mongoose.Types.ObjectId;

  @Prop({ required: true, type: String })
  mqttTopic: string;
}

export const SubSystemSchema = SchemaFactory.createForClass(SubSystem);
