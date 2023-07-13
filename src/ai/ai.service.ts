import { Injectable } from '@nestjs/common';
import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from 'openai';
import { Message } from 'src/common/interfaces/message';
import { trimString } from 'src/common/helpers/stringManipulation';
@Injectable()
export class AiService {
  private readonly openai: OpenAIApi;

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.openai = new OpenAIApi(configuration);
  }

  async generateText({
    messages,
    preInstruction,
    responseMaxLength,
  }: {
    messages: Message[];
    preInstruction?: string;
    responseMaxLength?: number;
  }): Promise<string> {
    try {
      const chatCompletion = await this.openai.createChatCompletion({
        model: process.env.AI_MODEL,
        messages: messages.map((msg) => {
          return {
            role: ChatCompletionRequestMessageRoleEnum[msg.role],
            content: `${preInstruction ?? ''} ${msg.content}`,
          };
        }),
      });
      const aiResponse = trimString(
        chatCompletion.data.choices[0].message.content,
        responseMaxLength,
      );

      return aiResponse;
    } catch (error) {
      throw error;
    }
  }
}
