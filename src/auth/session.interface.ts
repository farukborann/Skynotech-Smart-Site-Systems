import { RoleEnum, RoleEnumType } from 'src/access-control/access-control.enum';

export interface SessionUser {
  _id: string;
  email: string;
  profilePhoto: string;
  phoneNumber: string;
  role: RoleEnumType;
}

export const SystemSession = {
  _id: 'system',
  email: '',
  profilePhoto: '',
  phoneNumber: '',
  role: RoleEnum.SUPER_ADMIN,
};
