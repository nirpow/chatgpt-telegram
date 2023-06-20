import { Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class TelegramService {
  private readonly bot: TelegramBot;

  constructor() {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
      polling: true,
    });
    this.initializeBot();
  }

  private initializeBot(): void {
    this.bot.on('message', (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text;

      // send a message to the chat acknowledging receipt of their message
      this.bot.sendMessage(chatId, 'Received your message.' + text);
    });
  }
}
