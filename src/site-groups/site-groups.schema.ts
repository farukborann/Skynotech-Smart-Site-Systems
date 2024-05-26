import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SiteGroup extends Document {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({
    required: true,
    type: [mongoose.Types.ObjectId],
    default: [],
    ref: 'sites',
  })
  sites: mongoose.Types.ObjectId[];

  @Prop({
    required: true,
    type: [mongoose.Types.ObjectId],
    default: [],
    ref: 'users',
  })
  siteGroupAdmins: mongoose.Types.ObjectId[];

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

export const SiteGroupSchema = SchemaFactory.createForClass(SiteGroup);
