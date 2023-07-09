import { Injectable } from '@nestjs/common';
import { ChatLog } from './schemas/chatLog.schema';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(ChatLog.name) private chatLogModel: Model<ChatLog>,
  ) {}

  // Users
  async createUser(
    telegramId: string,
    username: string,
    customFields: string,
  ): Promise<User> {
    const newUser = new this.userModel({
      telegramId,
      username,
      customFields,
    });
    try {
      return await newUser.save();
    } catch (error) {
      throw error;
    }
  }

  async findUserByTelegramId(telegramId: string): Promise<User | null> {
    try {
      return await this.userModel.findOne({ telegramId }).exec();
    } catch (error) {
      throw error;
    }
  }

  async updateUserFields(
    telegramId: string,
    customFields: string,
  ): Promise<User | null> {
    try {
      return await this.userModel
        .findOneAndUpdate({ telegramId }, { customFields }, { new: true })
        .exec();
    } catch (error) {
      throw error;
    }
  }

  //Chat Log
  async createChatLog(user: User, conversation: string): Promise<ChatLog> {
    const newUser = new this.chatLogModel({
      user,
      conversation,
    });
    try {
      return await newUser.save();
    } catch (error) {
      throw error;
    }
  }
}
