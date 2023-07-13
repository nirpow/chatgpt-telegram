import { Roles } from '../enums/roles';

export interface Message {
  role: Roles;
  content: string;
}
