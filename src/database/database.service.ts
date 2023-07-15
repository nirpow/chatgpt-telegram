import { Injectable } from '@nestjs/common';
import { ChatLog } from './schemas/chatLog.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './schemas/message.schema';
import { ChatLogPreviewDto } from 'src/common/dtos/chatLogPreviewDto';
import { IChatLog } from 'src/common/interfaces/chatLog';
import { ERoles } from 'src/common/enums/roles';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectModel(ChatLog.name) private chatLogModel: Model<ChatLog>,
  ) {}

  async createChatLog({
    title,
    conversation,
  }: {
    title?: string;
    conversation?: string;
  }): Promise<string> {
    const newChatLog = new this.chatLogModel({
      title,
      conversation,
    });
    try {
      const savedChatLog = await newChatLog.save();
      return savedChatLog.id;
    } catch (error) {
      throw error;
    }
  }

  async updateChatLog({
    id,
    title,
    conversation,
  }: {
    id: string;
    title: string;
    conversation: Message[];
  }): Promise<ChatLog> {
    try {
      const updatedChatLog = await this.chatLogModel.findByIdAndUpdate(
        id,
        { title, conversation },
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

  async getChatLogsPreview({
    numOfChats,
    skip,
  }: {
    numOfChats: number;
    skip: number;
  }): Promise<ChatLogPreviewDto[]> {
    try {
      const chatLogs = await this.chatLogModel
        .find()
        .sort({ _id: -1 })
        .skip(skip)
        .limit(numOfChats)
        .select('title')
        .exec();
      return chatLogs.map((chatLog) => ({
        title: chatLog.title,
        id: chatLog._id.toString(),
      }));
    } catch (error) {
      throw error;
    }
  }

  async getChatLogById({ id }: { id: string }): Promise<IChatLog> {
    const chatLogDoc = await this.chatLogModel.findById(id);
    return {
      id: chatLogDoc.id,
      title: chatLogDoc.title,
      conversation: chatLogDoc.conversation.map((msg) => {
        return { content: msg.content, role: msg.role as ERoles };
      }),
    };
  }
}
