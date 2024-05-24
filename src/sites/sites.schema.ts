import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Site extends Document {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  address: string;

  @Prop({ required: true, type: String })
  province: string;

  @Prop({ required: true, type: String })
  district: string;

  @Prop({ required: true, type: [mongoose.Types.ObjectId], default: [] })
  users: mongoose.Types.ObjectId[];
}

export const SiteSchema = SchemaFactory.createForClass(Site);
