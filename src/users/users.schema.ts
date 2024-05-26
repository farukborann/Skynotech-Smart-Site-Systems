import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  RoleEnumArray,
  RoleEnumType,
} from 'src/access-control/access-control.enum';

@Schema({ timestamps: true })
class PrivacySettings extends Document {
  @Prop({ required: true, type: Boolean, default: true })
  showEmail: boolean;

  @Prop({ required: true, type: Boolean, default: true })
  showPhoneNumber: boolean;

  @Prop({ required: true, type: Boolean, default: true })
  showProfilePhoto: boolean;
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, type: String, unique: true })
  email: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ required: true, type: String, default: '' })
  profilePhoto: string;

  @Prop({ required: true, type: String, default: '' })
  phoneNumber: string;

  @Prop({
    required: true,
    type: PrivacySettings,
    default: () => ({}),
  })
  privacySettings: PrivacySettings;

  @Prop({
    required: true,
    enum: RoleEnumArray,
  })
  role: RoleEnumType;
}

export const UserSchema = SchemaFactory.createForClass(User);
