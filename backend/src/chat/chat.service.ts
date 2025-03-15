import { Injectable, Logger } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { Socket } from 'socket.io';

import { DrizzleDb, InjectDrizzle, Message, toMessageDto } from '@database';
import { AnthropicService } from '@llm/models/anthropic.service';
import { generateId } from '@shared';
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
    const response = await this.llmService.sendMessage(
      context,
      lastMessage.content,
    );

    const msg = await this.db
      .insert(Message)
      .values({
        id: generateId(),
        threadId,
        author: 'assistant',
        content: response,
      })
      .returning();

    socket.emit('message_received', toMessageDto(msg[0]));
  }
}
