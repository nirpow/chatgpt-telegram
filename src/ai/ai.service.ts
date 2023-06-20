import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAIApi;

  constructor(private httpService: HttpService) {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.openai = new OpenAIApi(configuration);
  }

  async generateText(prompt: string): Promise<string> {
    const chatCompletion = await this.openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });
    return chatCompletion.data.choices[0].message.content;
  }
}
