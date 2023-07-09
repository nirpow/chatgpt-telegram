import { Injectable } from '@nestjs/common';
import { AiService } from 'src/ai/ai.service';

enum Roles {
  USER_ROLE_NAME = 'User',
  AI_ROLE_NAME = 'Assistant',
}

interface Message {
  role: Roles;
  text: string;
}

interface UserData {
  messages: Message[];
}

const usersData: Map<number, UserData> = new Map();

@Injectable()
export class ChatService {
  // private readonly currentUser: User;

  constructor(private readonly aiService: AiService) {}

  startNewChat(userId: number): void {
    if (usersData.has(userId)) {
      usersData.set(userId, { messages: [] });
    }
  }

  async sendNewMassege(
    text: string,
    telegramUserId: number,
    isBot: boolean,
  ): Promise<string> {
    // Check if data for this user already exists
    if (!usersData.has(telegramUserId)) {
      usersData.set(telegramUserId, { messages: [] });
    }

    // Store the data for this user
    const userData = usersData.get(telegramUserId);

    userData.messages.push({
      role: isBot ? Roles.AI_ROLE_NAME : Roles.USER_ROLE_NAME,
      text: text,
    });

    const conversation = userData.messages
      .map((message) => {
        return `${message.role}: ${message.text}`;
      })
      .join('\n');

    const output = await this.aiService.generateText(conversation);
    // Add bot's reply to user's data
    userData.messages.push({
      role: Roles.AI_ROLE_NAME,
      text: output,
    });
    console.log(`str len ${userData.messages.toString().length}`);

    return output;
  }
}
