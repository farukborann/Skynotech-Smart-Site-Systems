import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RoleEnum } from 'src/access-control/access-control.enum';

@Schema({ timestamps: true })
class PrivacySettings extends Document {
  @Prop({ required: true, type: Boolean, default: true })
  showEmail: boolean;

  @Prop({ required: true, type: Boolean, default: true })
  showPhoneNumber: boolean;

  @Prop({ required: true, type: Boolean, default: true })
  showProfilePhoto: boolean;

  @Prop({
    required: true,
    enum: ['admin', 'site-admin', 'user'],
    default: 'user',
  })
  whoCanSendTickets: 'admin' | 'site-admin' | 'user';
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
    enum: RoleEnum,
  })
  role: RoleEnum;
}

export const UserSchema = SchemaFactory.createForClass(User);
