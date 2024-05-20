import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
class PrivacySettings extends Document {
  @Prop({ required: true, type: Boolean })
  showEmail: boolean;

  @Prop({ required: true, type: Boolean })
  showPhoneNumber: boolean;

  @Prop({ required: true, type: Boolean })
  showProfilePhoto: boolean;

  @Prop({ required: true, type: String }) // enum: ['admin', 'site-admin', 'user']
  whoCanSendTickets: string;
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, type: String })
  email: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ required: true, type: String })
  profilePhoto: string;

  @Prop({ required: true, type: String })
  phoneNumber: string;

  @Prop({ required: true, type: PrivacySettings })
  profileSettings: PrivacySettings;

  @Prop({
    required: true,
    enum: ['super-admin', 'admin', 'site-admin', 'user'],
  })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
