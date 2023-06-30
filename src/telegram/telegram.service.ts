import { Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { AiService } from 'src/ai/ai.service';
import { I18nService } from 'nestjs-i18n';

enum MainMenuOptions {
  NEW_CHAT = 'NEW_CHAT',
  SETTINGS = 'SETTINGS',
}

interface Message {
  role: string;
  text: string;
}

interface UserData {
  messages: Message[];
}

const usersData: Map<number, UserData> = new Map();

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
      async (callbackQuery: TelegramBot.CallbackQuery) => {
        const action = callbackQuery.data;

        const msg = callbackQuery.message;

        const editMesssageTextOptions: TelegramBot.EditMessageTextOptions = {
          chat_id: msg.chat.id,
          message_id: msg.message_id,
        };
        let text: string;
        const userId: number = msg.chat.id;

        switch (action) {
          case MainMenuOptions.NEW_CHAT:
            // Check if data for this user already exists and delete it
            if (usersData.has(userId)) {
              usersData.set(userId, { messages: [] });
            }

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

    this.bot.on('message', async (msg: TelegramBot.Message) => {
      if (!msg.text.startsWith('/')) {
        const userId: number = msg.from.id;

        // Check if data for this user already exists
        if (!usersData.has(userId)) {
          usersData.set(userId, { messages: [] });
        }

        // Store the data for this user
        const userData = usersData.get(userId);
        userData.messages.push({
          role: msg.from.is_bot ? 'Assistant' : 'User',
          text: msg.text,
        });

        const conversation = userData.messages
          .map((message) => {
            return `${message.role}: ${message.text}`;
          })
          .join('\n');

        try {
          const output = await this.aiService.generateText(conversation);
          const reply = await this.bot.sendMessage(msg.chat.id, output);

          // Add bot's reply to user's data
          userData.messages.push({
            role: 'Assistant',
            text: reply.text,
          });
        } catch (error) {
          this.bot.sendMessage(msg.chat.id, this.i18n.t('app.error_msg'));
        }
        console.log(`str len ${userData.messages.toString().length}`);
      }
    });
  }
}
