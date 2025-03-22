import { Injectable, Logger } from '@nestjs/common';
import { cosineDistance, desc, eq, gt, sql } from 'drizzle-orm';

import { ConfigService } from '@config';
import { DrizzleDb, InjectDrizzle } from '@database';
import * as schema from '@database';
import { AnthropicService } from '@llm/models/anthropic.service';

import { EmbeddingService } from './embedding.service';

interface EmbeddingResponse {
  object: 'list';
  data: { object: 'embedding'; embedding: number[]; index: number }[];
  model: string;
  usage: {
    total_tokens: number;
  };
}

interface SimilarityResult {
  fileId: string;
  content: string;
  similarity: number;
}

@Injectable()
export class VoyageAdapterService extends EmbeddingService {
  private readonly logger: Logger = new Logger('Embedding Service');
  private readonly httpHeader: RequestInit;
  private getHttpOptions(
    input: string[],
    abortSignal?: AbortSignal,
  ): RequestInit {
    return {
      method: 'POST',
      ...this.httpHeader,
      body: JSON.stringify({
        input,
        model: 'voyage-3',
      }),
      signal: abortSignal,
    };
  }

  constructor(
    private readonly configService: ConfigService,
    @InjectDrizzle()
    private readonly db: DrizzleDb,
    private readonly llmService: AnthropicService,
  ) {
    super();
    this.httpHeader = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.configService.ingestion.voyageai.apiKey}`,
      },
    };
  }

  async deleteAllEmbeddings(fileId: string): Promise<void> {
    this.logger.debug('Deleting all existing embeddings for file', fileId);
    await this.db
      .delete(schema.Embedding)
      .where(eq(schema.Embedding.fileId, fileId));
  }

  async createEmbeddings(
    fileId: string,
    content: string[],
    abortSignal: AbortSignal,
  ) {
    try {
      this.logger.debug('Creating embeddings with Voyage');
      const response = await fetch(
        'https://api.voyageai.com/v1/embeddings',
        this.getHttpOptions(content, abortSignal),
      );

      const { data } = (await response.json()) as EmbeddingResponse;
      for (const embedding of data) {
        const keywords = await this.llmService.generateEmbeddingKeywords(
          content[embedding.index],
        );
        await this.db.insert(schema.Embedding).values({
          fileId,
          content: content[embedding.index],
          keywords,
          embedding: embedding.embedding,
        });
      }

      this.logger.log(`Inserted ${data.length} embeddings`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error creating embeddings: ${errorMessage}`);
    }
  }

  async findSimilarEmbeddings(
    query: string,
    limit = 5,
  ): Promise<SimilarityResult[]> {
    try {
      // Get embedding for the query
      const response = await fetch(
        'https://api.voyageai.com/v1/embeddings',
        this.getHttpOptions([query]),
      );

      const data = (await response.json()) as EmbeddingResponse;
      const queryEmbedding = data.data[0].embedding;

      const similarity = sql<number>`1 - (${cosineDistance(
        schema.Embedding.embedding,
        queryEmbedding,
      )})`;
      const similarEmbeddings = await this.db
        .select({
          fileId: schema.Embedding.fileId,
          content: schema.Embedding.content,
          similarity,
        })
        .from(schema.Embedding)
        .where(gt(similarity, 0.5))
        .orderBy(desc(similarity))
        .limit(limit);

      return similarEmbeddings;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error finding similar embeddings: ${errorMessage}`);
      throw error;
    }
  }
}
