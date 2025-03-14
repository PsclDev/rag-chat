import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

import { ChatService } from './chat.service';
import { NewChatMessageDto } from './dto/message.dto';

@WebSocketGateway({
  namespace: '/chat',
  transports: ['websocket', 'polling'],
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayDisconnect {
  private readonly logger = new Logger('ChatGateway');
  private clientThreadMap = new Map<string, string>();

  constructor(private readonly chatService: ChatService) {
    this.logger.log('Chat gateway initialized');
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client ${client.id} disconnected`);
    this.clientThreadMap.delete(client.id);
    client.disconnect(true);
  }

  @SubscribeMessage('join_thread')
  handleJoinThread(
    @ConnectedSocket() client: Socket,
    @MessageBody() threadId: string,
  ) {
    const previousThread = this.clientThreadMap.get(client.id);
    if (previousThread) {
      this.logger.debug(
        `Client ${client.id} leaving previous thread ${previousThread}`,
      );
      client.leave(previousThread);
    }

    this.logger.debug(`Client ${client.id} joining thread ${threadId}`);
    this.clientThreadMap.set(client.id, threadId);
    client.join(threadId);
  }

  @SubscribeMessage('send_message')
  handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: NewChatMessageDto,
  ) {
    const currentThread = this.clientThreadMap.get(client.id);
    if (!currentThread) {
      this.logger.warn(
        `Client ${client.id} attempted to send message without joining a thread`,
      );
      client.emit('error', 'Not joined to any thread');
      return;
    }

    if (currentThread !== payload.threadId) {
      this.logger.warn(
        `Client ${client.id} attempted to send message to thread ${payload.threadId} while joined to ${currentThread}`,
      );
      client.emit(
        'error',
        'Cannot send message to a thread you have not joined',
      );
      return;
    }

    this.logger.debug(
      `Client ${client.id} sending message to thread ${currentThread}`,
    );
    this.chatService.newMessage(client, payload);
  }
}
