import { Controller, Get } from '@nestjs/common';

import { ChatHistoryService } from './chat-history.service';
import { ThreadDto } from './dto/thread.dto';
import { toThreadDto } from './schema/thread.schema';

@Controller('chat-history')
export class ChatHistoryController {
  constructor(private readonly chatHistoryService: ChatHistoryService) {}

  @Get()
  async getThreads(): Promise<ThreadDto[]> {
    const result = await this.chatHistoryService.getAllThreads();
    return result.map(toThreadDto);
  }
}
