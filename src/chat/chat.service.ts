import { Injectable } from '@nestjs/common';
import { AiService } from 'src/ai/ai.service';
import { ChatLogPreviewDto } from 'src/common/dtos/chatLogPreviewDto';
import { ERoles } from 'src/common/enums/roles';
import { AwaitingApiResponseException } from 'src/common/exceptions/awaiting_api_response_exception';
import { IChatLog } from 'src/common/interfaces/chatLog';
import { AI_INSTRUCTIONS } from 'src/common/strings/aiInstructions';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ChatService {
  private currentChatData: IChatLog;
  private isProcessing = false;

  constructor(
    private readonly aiService: AiService,
    private readonly databaseService: DatabaseService,
  ) {}

  async startNewChat(): Promise<void> {
    try {
      const chatLogId = await this.databaseService.createChatLog({});
      this.currentChatData = { conversation: [], id: chatLogId };
    } catch (error) {
      throw error;
    }
  }

  async loadExistingChat({
    chatLogId,
  }: {
    chatLogId: string;
  }): Promise<IChatLog> {
    try {
      const chatLog = await this.databaseService.getChatLogById({
        id: chatLogId,
      });

      this.currentChatData = {
        id: chatLog.id,
        title: chatLog.title,
        conversation: chatLog.conversation,
      };

      return chatLog;
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
      return this.databaseService.getChatLogsPreview({ numOfChats, skip });
    } catch (error) {
      throw error;
    }
  }
  async sendNewMessage({ text }: { text: string }): Promise<string> {
    try {
      if (!this.currentChatData) {
        throw new Error('Current chat data has not initialized yet');
      }
      if (this.isProcessing) {
        throw new AwaitingApiResponseException(
          'Response message is currently being processed',
        );
      }

      this.isProcessing = true;

      // Add user message to conversation
      this.currentChatData.conversation.push({
        role: ERoles.USER_ROLE_NAME,
        content: text,
      });

      if (!this.currentChatData.title) {
        // Generate title
        this.currentChatData.title = await this.aiService.generateText({
          messages: this.currentChatData.conversation,
          preInstruction: AI_INSTRUCTIONS.TITLE,
          responseMaxLength: 27,
        });
      }

      const output = await this.aiService.generateText({
        messages: this.currentChatData.conversation,
      });

      // Add reply to conversation
      this.currentChatData.conversation.push({
        role: ERoles.AI_ROLE_NAME,
        content: output,
      });

      // update chatLogCollection
      await this.databaseService.updateChatLog({
        id: this.currentChatData.id,
        title: this.currentChatData.title,
        conversation: this.currentChatData.conversation,
      });
      return output;
    } catch (error) {
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }
}
