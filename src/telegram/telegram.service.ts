import { Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { AiService } from 'src/ai/ai.service';

@Injectable()
export class TelegramService {
  private readonly bot: TelegramBot;

  constructor(private readonly aiService: AiService) {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
      polling: true,
    });
    this.initializeBot();
  }

  private initializeBot(): void {
    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id;

      const text = msg.text;

      try {
        const output = await this.aiService.generateText(text);
        this.bot.sendMessage(chatId, output);
      } catch (error) {
        this.bot.sendMessage(chatId, 'Error: Something went wrong... ):');
      }
    });
  }
}
