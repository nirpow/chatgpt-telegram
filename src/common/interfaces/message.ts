import { ERoles } from '../enums/roles';

export interface IMessage {
  role: ERoles;
  content: string;
}
