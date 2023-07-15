import { Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { I18nService } from 'nestjs-i18n';
import { ChatService } from 'src/chat/chat.service';
import { AwaitingApiResponseException } from 'src/common/exceptions/awaiting_api_response_exception';
import { ChatLogPreviewDto } from 'src/common/dtos/chatLogPreviewDto';
import { convertConversationToString } from './helpers/stringManipulations';
import { eBotMenuState } from './enums/botMenuState';
import { eMainMenuOptions } from './enums/mainMenuOptions';

@Injectable()
export class TelegramService {
  private readonly bot: TelegramBot;
  private currentMenuState: eBotMenuState = eBotMenuState.MAIN_MENU;

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

  private async loadHistoryList({
    numOfChats,
    skip,
  }: {
    numOfChats: number;
    skip: number;
  }): Promise<ChatLogPreviewDto[]> {
    const list = await this.chatService.getChatLogsPreview({
      numOfChats,
      skip,
    });
    return list;
  }

  private showMainMenu(chatId: number): void {
    const SendMessageOptions: TelegramBot.SendMessageOptions = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `\u{2795} ${this.i18n.t('app.new_chat')}`,
              callback_data: eMainMenuOptions.NEW_CHAT,
            },
          ],
          [
            {
              text: `\u{1F4C1} ${this.i18n.t('app.chat_history')}`,
              callback_data: eMainMenuOptions.HISTORY,
            },
          ],
          [
            {
              text: this.i18n.t('app.settings'),
              callback_data: eMainMenuOptions.SETTINGS,
            },
          ],
        ],
      },
    };

    this.bot.sendMessage(
      chatId,
      this.i18n.t('app.opening_msg') + '\u{1F604}',
      SendMessageOptions,
    );
  }

  private async handleMainMenuClick(
    callbackQuery: TelegramBot.CallbackQuery,
  ): Promise<void> {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;

    const editMessageTextOptions: TelegramBot.EditMessageTextOptions = {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
    };
    let text: string;

    switch (action) {
      case eMainMenuOptions.NEW_CHAT:
        this.startNewChat();
        text = this.i18n.t('app.starting_new_chat_msg');
        break;
      case eMainMenuOptions.HISTORY:
        this.currentMenuState = this.currentMenuState =
          eBotMenuState.HISTORY_LIST;
        this.showHistoryList(msg.chat.id);
        text = this.i18n.t('app.loading_history_list');
        break;
      case eMainMenuOptions.SETTINGS:

      default:
        break;
    }

    if (text) {
      this.bot.editMessageText(text, editMessageTextOptions);
    }
  }

  private async showHistoryList(chatId: number): Promise<void> {
    this.currentMenuState = eBotMenuState.HISTORY_LIST;

    const conversationList = await this.loadHistoryList({
      skip: 0,
      numOfChats: 15,
    });

    const buttons: TelegramBot.InlineKeyboardButton[][] = conversationList.map(
      (option) => [
        { text: option.title ?? 'New chat', callback_data: option.id },
      ],
    );
    const keyboard: TelegramBot.InlineKeyboardMarkup = {
      inline_keyboard: buttons,
    };

    this.bot.sendMessage(
      chatId,
      `${this.i18n.t('app.select_chat_from_list')} \u{1F4C3}`,
      {
        reply_markup: keyboard,
      },
    );
  }

  private async handleHistoryItemClick(
    callbackQuery: TelegramBot.CallbackQuery,
  ) {
    const conversationId = callbackQuery.data;
    const msg = callbackQuery.message;

    const editMessageTextOptions: TelegramBot.EditMessageTextOptions = {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
    };

    const chatLog = await this.chatService.loadExistingChat({
      chatLogId: conversationId,
    });

    await this.bot.sendMessage(
      msg.chat.id,
      convertConversationToString(chatLog),
      { parse_mode: 'Markdown' },
    );

    const text = `${chatLog.title}`;

    if (text) {
      this.bot.editMessageText(text, editMessageTextOptions);
    }
  }

  private initializeBot(): void {
    this.bot.onText(/\/start/, (msg: TelegramBot.Message) => {
      this.currentMenuState = eBotMenuState.MAIN_MENU;
      const chatId = msg.chat.id;
      this.showMainMenu(chatId);
    });

    this.bot.on(
      'callback_query',
      async (callbackQuery: TelegramBot.CallbackQuery): Promise<void> => {
        switch (this.currentMenuState) {
          case eBotMenuState.MAIN_MENU:
            this.handleMainMenuClick(callbackQuery);
            break;
          case eBotMenuState.HISTORY_LIST:
            this.handleHistoryItemClick(callbackQuery);
            break;

          default:
            break;
        }
      },
    );

    this.bot.on('message', async (msg: TelegramBot.Message): Promise<void> => {
      try {
        if (!msg.from.is_bot) {
          if (!msg.text.startsWith('/')) {
            const output = await this.chatService.sendNewMessage({
              text: msg.text,
            });
            await this.bot.sendMessage(msg.chat.id, output);
          }
        }
      } catch (error) {
        if (error instanceof AwaitingApiResponseException) {
          this.bot.sendMessage(
            msg.chat.id,
            this.i18n.t('app.ai_is_processing'),
          );
        } else {
          this.bot.sendMessage(
            msg.chat.id,
            `${this.i18n.t('app.error_msg')}  
            [${error}]`,
          );
        }
      }
    });
  }
}
