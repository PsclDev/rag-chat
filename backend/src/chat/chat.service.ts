import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

import { DrizzleDb, InjectDrizzle, Message, toMessageDto } from '@database';
import { generateId } from '@shared';

import { NewChatMessageDto } from './dto/message.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger('ChatGateway');

  constructor(
    @InjectDrizzle()
    private readonly db: DrizzleDb,
  ) {}

  async newMessage(socket: Socket, message: NewChatMessageDto) {
    const msg = await this.db
      .insert(Message)
      .values({
        id: generateId(),
        threadId: message.threadId,
        author: 'user',
        content: message.message,
      })
      .returning();

    socket.emit('message_received', toMessageDto(msg[0]));
    this.fakeMessage(socket, message.threadId);
  }

  fakeMessage(socket: Socket, threadId: string) {
    const loremMessage =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

    socket.emit('message_received', {
      id: generateId(),
      threadId: threadId,
      author: 'assistant',
      content: loremMessage,
      writtenAt: new Date().toISOString(),
    });
  }
}
