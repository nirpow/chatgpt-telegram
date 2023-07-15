import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ERoles } from 'src/common/enums/roles';

export type MessageDocument = HydratedDocument<Message>;
@Schema({ _id: false })
export class Message {
  @Prop({ type: String, enum: Object.values(ERoles), required: true })
  role: string;

  @Prop({ type: String, required: true })
  content: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
