import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SubSystem extends Document {
  @Prop({
    required: true,
    enum: [
      'garden-watering',
      'lighting',
      'boiler',
      'ventilation',
      'pool',
      'waste-water-pump',
    ],
  })
  systemType:
    | 'garden-watering'
    | 'lighting'
    | 'boiler'
    | 'ventilation'
    | 'pool'
    | 'waste-water-pump';

  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: 'sites' })
  siteId: mongoose.Types.ObjectId;
}

export const SubSystemSchema = SchemaFactory.createForClass(SubSystem);
