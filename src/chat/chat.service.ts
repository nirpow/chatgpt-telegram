import { Injectable } from '@nestjs/common';
import { AiService } from 'src/ai/ai.service';
import { Roles } from 'src/common/enums/roles';
import { AwaitingApiResponseException } from 'src/common/exceptions/awaiting_api_response_exception';
import { Message } from 'src/common/interfaces/message';
import { AI_INSTRUCTIONS } from 'src/common/strings/aiInstructions';

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

  async sendNewMassege({
    text,
    isBot,
  }: {
    text: string;
    isBot: boolean;
  }): Promise<string> {
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

        if (!this.currentChatData.title) {
          this.currentChatData.title = await this.aiService.generateText({
            messages: this.currentChatData.messages,
            preInstruction: AI_INSTRUCTIONS.TITLE,
            responseMaxLength: 27,
          });
        }

        const output = await this.aiService.generateText({
          messages: this.currentChatData.messages,
        });

        // Add bot's reply to user's data
        this.currentChatData.messages.push({
          role: Roles.AI_ROLE_NAME,
          content: output,
        });
        console.log(this.currentChatData.title);
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
