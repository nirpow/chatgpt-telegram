import { Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { I18nService } from 'nestjs-i18n';
import { ChatService } from 'src/chat/chat.service';
import { AwaitingApiResponseException } from 'src/common/exceptions/awaiting_api_response_exception';

enum MainMenuOptions {
  NEW_CHAT = 'NEW_CHAT',
  SETTINGS = 'SETTINGS',
}

@Injectable()
export class TelegramService {
  private readonly bot: TelegramBot;

  constructor(
    private readonly i18n: I18nService,
    private readonly chatService: ChatService,
  ) {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
      polling: true,
    });
    this.initializeBot();
  }

  startNewChat(): void {
    this.chatService.startNewChat();
  }

  showMainMenu(chatId: number): void {
    const SendMessageOptions: TelegramBot.SendMessageOptions = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: this.i18n.t('app.new_chat'),
              callback_data: MainMenuOptions.NEW_CHAT,
            },
          ],
          [
            {
              text: this.i18n.t('app.settings'),
              callback_data: MainMenuOptions.SETTINGS,
            },
          ],
        ],
      },
    };

    this.bot.sendMessage(
      chatId,
      this.i18n.t('app.opening_msg'),
      SendMessageOptions,
    );
  }

  private initializeBot(): void {
    this.bot.onText(/\/start/, (msg: TelegramBot.Message) => {
      const chatId = msg.chat.id;
      this.showMainMenu(chatId);
    });

    this.bot.on(
      'callback_query',
      async (callbackQuery: TelegramBot.CallbackQuery): Promise<void> => {
        const action = callbackQuery.data;

        const msg = callbackQuery.message;

        const editMesssageTextOptions: TelegramBot.EditMessageTextOptions = {
          chat_id: msg.chat.id,
          message_id: msg.message_id,
        };
        let text: string;

        switch (action) {
          case MainMenuOptions.NEW_CHAT:
            this.startNewChat();

            text = this.i18n.t('app.starting_new_chat_msg');
            break;
          case MainMenuOptions.SETTINGS:

          default:
            break;
        }

        if (text) {
          this.bot.editMessageText(text, editMesssageTextOptions);
        }
      },
    );

    this.bot.on('message', async (msg: TelegramBot.Message): Promise<void> => {
      try {
        if (!msg.text.startsWith('/')) {
          const output = await this.chatService.sendNewMassege({
            text: msg.text,
            isBot: msg.from.is_bot,
          });
          await this.bot.sendMessage(msg.chat.id, output);
        }
      } catch (error) {
        if (error instanceof AwaitingApiResponseException) {
          this.bot.sendMessage(
            msg.chat.id,
            this.i18n.t('app.ai_is_processing'),
          );
        } else {
          this.bot.sendMessage(msg.chat.id, this.i18n.t('app.error_msg'));
        }
      }
    });
  }
}
