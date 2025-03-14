export interface MessageDto {
  id: string;
  author: 'user' | 'assistant';
  content: string;
  writtenAt: Date;
}

export interface NewChatMessageDto {
  threadId: string;
  message: string;
}
