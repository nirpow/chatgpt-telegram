import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { ChatLogSchema } from './schemas/chatLog.schema';
import { DatabaseService } from './database.service';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/bot'),
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'ChatLog', schema: ChatLogSchema },
    ]),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
