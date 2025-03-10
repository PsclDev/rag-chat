import { Module } from '@nestjs/common';

import { ChatHistoryController } from './chat-history.controller';
import { ChatHistoryService } from './chat-history.service';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  controllers: [ChatHistoryController],
  providers: [ChatHistoryService, ChatService, ChatGateway],
})
export class ChatModule {}
