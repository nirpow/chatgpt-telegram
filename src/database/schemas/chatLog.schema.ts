import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Message, MessageSchema } from './message.schema';

export type ChatLogDocument = HydratedDocument<ChatLog>;

@Schema({ timestamps: true })
export class ChatLog {
  @Prop({ type: String })
  title: string;

  @Prop({ type: [MessageSchema], default: [] })
  conversation: Message[];
}

export const ChatLogSchema = SchemaFactory.createForClass(ChatLog);
