export interface MessageDto {
  id: string;
  author: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
