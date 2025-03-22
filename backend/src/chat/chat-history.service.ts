import { Injectable, Logger } from '@nestjs/common';
import { desc } from 'drizzle-orm';

import { DrizzleDb, InjectDrizzle, Thread, ThreadEntity } from '@database';

@Injectable()
export class ChatHistoryService {
  private readonly logger = new Logger('ChatHistoryService');

  constructor(
    @InjectDrizzle()
    private readonly db: DrizzleDb,
  ) {}

  async getAllThreads(): Promise<ThreadEntity[]> {
    return await this.db.query.Thread.findMany({
      with: {
        messages: true,
      },
      orderBy: [desc(Thread.lastMessageAt)],
    });
  }
}
