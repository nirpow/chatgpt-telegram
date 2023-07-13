import { Injectable } from '@nestjs/common';
import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from 'openai';
import { Message } from 'src/common/interfaces/message';

@Injectable()
export class AiService {
  private readonly openai: OpenAIApi;

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.openai = new OpenAIApi(configuration);
  }

  async generateText(messages: Message[]): Promise<string> {
    try {
      const chatCompletion = await this.openai.createChatCompletion({
        model: process.env.AI_MODEL,
        messages: messages.map((msg) => {
          return {
            role: ChatCompletionRequestMessageRoleEnum[msg.role],
            content: msg.content,
          };
        }),
      });
      return chatCompletion.data.choices[0].message.content;
    } catch (error) {
      throw error;
    }
  }
}
