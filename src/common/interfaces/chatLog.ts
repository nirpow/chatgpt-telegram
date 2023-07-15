import { IMessage } from './message';

export interface IChatLog {
  id?: string;
  title?: string;
  conversation: IMessage[];
}
