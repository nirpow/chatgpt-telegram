import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChatLogDocument = HydratedDocument<ChatLog>;

@Schema({ timestamps: true })
export class ChatLog {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  conversation: string;
}

export const ChatLogSchema = SchemaFactory.createForClass(ChatLog);
