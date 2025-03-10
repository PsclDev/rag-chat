import { Controller, Get } from '@nestjs/common';

import { ChatHistoryService } from './chat-history.service';
import { ThreadDto } from './dto/thread.dto';

@Controller('chat-history')
export class ChatHistoryController {
  constructor(private readonly chatHistoryService: ChatHistoryService) {}

  @Get()
  getThreads(): ThreadDto[] {
    return this.chatHistoryService.getAllThreads();
  }
}
