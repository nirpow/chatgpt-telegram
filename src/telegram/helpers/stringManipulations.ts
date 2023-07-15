import { IChatLog } from 'src/common/interfaces/chatLog';

export function convertConversationToString(chatLog: IChatLog): string {
  const stringBuilder = [];
  chatLog.conversation.forEach((msg) => {
    stringBuilder.push(`*${msg.role}:* ${msg.content}\n\n`);
  });
  return stringBuilder.join('');
}
