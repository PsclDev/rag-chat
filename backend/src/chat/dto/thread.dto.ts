import { MessageDto } from './message.dto';

export interface ThreadDto {
  id: string;
  title: string;
  messages: MessageDto[];
  messageCount: number;
  createdAt: Date;
  lastMessageAt: Date;
}
