import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Sensor extends Document {
  @Prop({
    required: true,
    type: String,
  })
  name: string;

  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: 'subsystems' })
  subSystemId: mongoose.Types.ObjectId;

  @Prop({ required: true, type: String })
  mqqtTopic: string;
}

export const SensorSchema = SchemaFactory.createForClass(Sensor);
