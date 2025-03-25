import { Injectable, Logger } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { Socket } from 'socket.io';

import {
  DrizzleDb,
  InjectDrizzle,
  Message,
  Thread,
  toMessageDto,
  toThreadDto,
} from '@database';
import { AnthropicService } from '@llm/models/anthropic.service';
import { EmbeddingService } from '@shared/embedding/embedding.service';

import { NewChatMessageDto } from './dto/message.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger('ChatGateway');

  constructor(
    @InjectDrizzle()
    private readonly db: DrizzleDb,
    private readonly embeddingService: EmbeddingService,
    private readonly llmService: AnthropicService,
  ) { }

  async newThread(socket: Socket, payload: NewChatMessageDto) {
    const thread = await this.db
      .insert(Thread)
      .values({
        title: 'New Chat',
      })
      .returning();

    const threadDto = toThreadDto({ ...thread[0], messages: [] });
    socket.emit('thread_created', threadDto);
    await this.newMessage(socket, {
      ...payload,
      threadId: thread[0].id,
    });
  }

  async newMessage(socket: Socket, message: NewChatMessageDto) {
    const msg = await this.db
      .insert(Message)
      .values({
        threadId: message.threadId,
        author: 'user',
        content: message.message,
      })
      .returning();

    socket.emit('message_received', toMessageDto(msg[0]));
    await this.generateResponse(socket, message.threadId);
  }

  async generateResponse(socket: Socket, threadId: string) {
    const messages = await this.db.query.Message.findMany({
      where: eq(Message.threadId, threadId),
      orderBy: [asc(Message.writtenAt)],
    });
    const lastMessage = messages[messages.length - 1];
    const similarEmbeds = await this.embeddingService.findSimilarEmbeddings(
      lastMessage.content,
    );

    this.logger.log(
      `Found ${similarEmbeds.length} similar embeddings for query '${lastMessage.content}'`,
    );

    const context = similarEmbeds.map((embed) => embed.content).join('\n');
    const response = await this.llmService.sendMessage(context, messages);

    const msg = await this.db
      .insert(Message)
      .values({
        threadId,
        author: 'assistant',
        content: response,
      })
      .returning();

    // TODO: This is a hack to get the title of the thread
    if (messages.length + 1 === 2) {
      const title = await this.llmService.generateThreadTitle(messages);
      const thread = await this.db
        .update(Thread)
        .set({ title })
        .where(eq(Thread.id, threadId))
        .returning();

      socket.emit(
        'thread_updated',
        toThreadDto({ ...thread[0], title, messages: [] }),
      );
    }

    socket.emit('message_received', toMessageDto(msg[0]));
  }
}
