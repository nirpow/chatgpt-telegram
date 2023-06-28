import { Injectable } from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';

@Injectable()
export class AiService {
  private readonly openai: OpenAIApi;

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.openai = new OpenAIApi(configuration);
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const chatCompletion = await this.openai.createChatCompletion({
        model: process.env.AI_MODEL,
        messages: [{ role: 'user', content: prompt }],
      });
      return chatCompletion.data.choices[0].message.content;
    } catch (error) {
      throw error;
    }
  }
}
