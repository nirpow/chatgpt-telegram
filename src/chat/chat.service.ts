import { Injectable } from '@nestjs/common';
import { AiService } from 'src/ai/ai.service';
import { Roles } from 'src/common/enums/roles';
import { AwaitingApiResponseException } from 'src/common/exceptions/awaiting_api_response_exception';
import { Message } from 'src/common/interfaces/message';
import { AI_INSTRUCTIONS } from 'src/common/strings/aiInstructions';

interface CurrentChatData {
  title?: string;
  conversation: Message[];
}
@Injectable()
export class ChatService {
  private currentChatData: CurrentChatData;
  private isProcessing = false;

  constructor(private readonly aiService: AiService) {}

  startNewChat(): void {
    this.currentChatData = { conversation: [] };
  }

  async sendNewMassege({ text }: { text: string }): Promise<string> {
    try {
      // Check if data is already exists
      if (!this.currentChatData) {
        this.currentChatData = { conversation: [] };
      }

      if (this.isProcessing) {
        throw new AwaitingApiResponseException(
          'Response message is currently being processed',
        );
      } else {
        this.isProcessing = true;

        // Add user to conversation
        this.currentChatData.conversation.push({
          role: Roles.USER_ROLE_NAME,
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
          role: Roles.AI_ROLE_NAME,
          content: output,
        });
        console.log(this.currentChatData.title);
        console.log(
          `str len ${this.currentChatData.conversation.toString().length}`,
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
