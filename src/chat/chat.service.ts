import { Injectable } from '@nestjs/common';
import { AiService } from 'src/ai/ai.service';
import { Roles } from 'src/common/enums/roles';
import { AwaitingApiResponseException } from 'src/common/exceptions/awaiting_api_response_exception';
import { Message } from 'src/common/interfaces/message';

interface CurrentChatData {
  title?: string;
  messages: Message[];
}
@Injectable()
export class ChatService {
  private currentChatData: CurrentChatData;
  private isProcessing = false;

  constructor(private readonly aiService: AiService) {}

  startNewChat(): void {
    this.currentChatData = { messages: [] };
  }

  async sendNewMassege(
    text: string,
    telegramUserId: number,
    isBot: boolean,
  ): Promise<string> {
    try {
      // Check if data is already exists
      if (!this.currentChatData) {
        this.currentChatData = { messages: [] };
      }

      if (this.isProcessing) {
        throw new AwaitingApiResponseException();
      } else {
        this.isProcessing = true;

        this.currentChatData.messages.push({
          role: isBot ? Roles.AI_ROLE_NAME : Roles.USER_ROLE_NAME,
          content: text,
        });

        const output = await this.aiService.generateText(
          this.currentChatData.messages,
        );

        // Add bot's reply to user's data
        this.currentChatData.messages.push({
          role: Roles.AI_ROLE_NAME,
          content: output,
        });
        console.log(
          `str len ${this.currentChatData.messages.toString().length}`,
        );

        return output;
      }
    } catch (error) {
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }
}
