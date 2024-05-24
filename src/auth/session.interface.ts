import { RoleEnumType } from 'src/access-control/access-control.enum';

export interface SessionUser {
  _id: string;
  email: string;
  profilePhoto: string;
  phoneNumber: string;
  role: RoleEnumType;
}
