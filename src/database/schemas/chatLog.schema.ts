import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';

export type ChatLogDocument = HydratedDocument<ChatLog>;

@Schema({ timestamps: true })
export class ChatLog {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ type: String, required: true })
  conversation: string;
}

export const ChatLogSchema = SchemaFactory.createForClass(ChatLog);
