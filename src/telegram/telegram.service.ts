import { Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { AiService } from 'src/ai/ai.service';
import { I18nService } from 'nestjs-i18n';

enum MainMenuOptions {
  NEW_CHAT = 'NEW_CHAT',
  SETTINGS = 'SETTINGS',
}

@Injectable()
export class TelegramService {
  private readonly bot: TelegramBot;

  constructor(
    private readonly aiService: AiService,
    private readonly i18n: I18nService,
  ) {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
      polling: true,
    });
    this.initializeBot();
  }

  private initializeBot(): void {
    this.bot.onText(/\/start/, (msg: TelegramBot.Message) => {
      const chatId = msg.chat.id;
      const SendMessageOptions: TelegramBot.SendMessageOptions = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: this.i18n.t('menu.new_chat'),
                callback_data: MainMenuOptions.NEW_CHAT,
              },
            ],
            [
              {
                text: this.i18n.t('menu.settings'),
                callback_data: MainMenuOptions.SETTINGS,
              },
            ],
          ],
        },
      };

      this.bot.sendMessage(
        chatId,
        'Welcome to our bot, choose an option:',
        SendMessageOptions,
      );
    });

    this.bot.on(
      'callback_query',
      (callbackQuery: TelegramBot.CallbackQuery) => {
        const action = callbackQuery.data;

        const msg = callbackQuery.message;
        const editMesssageTextOptions: TelegramBot.EditMessageTextOptions = {
          chat_id: msg.chat.id,
          message_id: msg.message_id,
        };
        let text: string;

        switch (action) {
          case MainMenuOptions.NEW_CHAT:
            newChat(msg.chat.id);
            text = 'Enter Your Prompt:';
            break;

          default:
            break;
        }

        if (text) {
          this.bot.editMessageText(text, editMesssageTextOptions);
        }
      },
    );

    const newChat = async (chatId: number) => {
      // this.bot.sendMessage(chatId, 'Enter Your Prompt');

      return null;
    };
  }
}
