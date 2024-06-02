import mongoose, { Document } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Sensor extends Document<mongoose.Types.ObjectId> {
  @Prop({
    required: true,
    type: String,
  })
  name: string;

  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: 'subsystems' })
  subSystemId: mongoose.Types.ObjectId;

  @Prop({ required: true, type: String })
  mqttTopic: string;
}

export const SensorSchema = SchemaFactory.createForClass(Sensor);
