import mongoose, { Document } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Scenario extends Document<mongoose.Types.ObjectId> {
  @Prop({
    required: true,
    type: String,
  })
  name: string;

  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: 'subsystems' })
  subSystemId: mongoose.Types.ObjectId;

  @Prop({ required: false, type: mongoose.Types.ObjectId, ref: 'sensors' })
  sensorId?: mongoose.Types.ObjectId;

  @Prop({ required: false, type: Number })
  min?: number;

  @Prop({ required: false, type: Number })
  max?: number;

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ required: true, type: Date })
  endDate: Date;

  @Prop({ required: true, type: Object })
  ignitions: { [key: string]: number };
}

export const ScenarioSchema = SchemaFactory.createForClass(Scenario);
