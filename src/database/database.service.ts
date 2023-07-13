import { Injectable } from '@nestjs/common';
import { ChatLog } from './schemas/chatLog.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectModel(ChatLog.name) private chatLogModel: Model<ChatLog>,
  ) {}

  //Chat Log
  async createChatLog(title: string, conversation: string): Promise<ChatLog> {
    const newChatLog = new this.chatLogModel({
      title,
      conversation,
    });
    try {
      return await newChatLog.save();
    } catch (error) {
      throw error;
    }
  }

  async updateChatLog(id: string, conversation: string): Promise<ChatLog> {
    try {
      const updatedChatLog = await this.chatLogModel.findByIdAndUpdate(
        id,
        { conversation },
        { new: true },
      );
      if (!updatedChatLog) {
        throw new Error('ChatLog not found');
      }
      return updatedChatLog;
    } catch (error) {
      throw error;
    }
  }

  async fetchRecentChats(numOfChats: number, skip: number): Promise<ChatLog[]> {
    try {
      return await this.chatLogModel
        .find()
        .sort({ _id: -1 })
        .skip(skip)
        .limit(numOfChats)
        .exec();
    } catch (error) {
      throw error;
    }
  }
}
