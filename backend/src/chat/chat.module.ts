import { Module } from '@nestjs/common';

import { LlmModule } from '@llm/llm.module';

import { ChatHistoryController } from './chat-history.controller';
import { ChatHistoryService } from './chat-history.service';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  imports: [LlmModule],
  controllers: [ChatHistoryController],
  providers: [ChatHistoryService, ChatService, ChatGateway],
})
export class ChatModule {}
