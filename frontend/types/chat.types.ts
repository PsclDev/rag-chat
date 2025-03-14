export interface ThreadDto {
  id: string;
  title: string;
  messages: MessageDto[];
  messageCount: number;
  createdAt: string;
  lastMessageAt: string;
}

export interface MessageDto {
  id: string;
  author: 'user' | 'assistant';
  content: string;
  writtenAt: string;
}