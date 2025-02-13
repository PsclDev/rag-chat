import { ConfigService } from '@config';
import { DrizzleDb, InjectDrizzle } from '@database';
import * as schema from '@database';
import { Injectable, Logger } from '@nestjs/common';
import { cosineDistance, desc, gt, sql } from 'drizzle-orm';
import { PartitionResponse } from 'unstructured-client/sdk/models/operations';

import { EmbeddingEntity } from './schema/embedding.schema';

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
export class EmbeddingService {
  private readonly logger: Logger = new Logger('Embedding Service');
  private readonly httpHeader: RequestInit;
  private getHttpOptions(input: string[]): RequestInit {
    return {
      method: 'POST',
      ...this.httpHeader,
      body: JSON.stringify({
        input,
        model: 'voyage-3',
      }),
    };
  }

  constructor(
    private readonly configService: ConfigService,
    @InjectDrizzle()
    private readonly db: DrizzleDb,
  ) {
    this.httpHeader = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.configService.ingestion.voyageai.apiKey}`,
      },
    };
  }

  async createEmbeddings(
    fileId: string,
    unstructuredResponse: PartitionResponse,
  ) {
    try {
      this.logger.debug('Deleting all existing embeddings');
      await this.db.delete(schema.Embedding);

      this.logger.debug('Preprocessing text');
      const preprocessedTexts = unstructuredResponse.elements
        .map((element) => this.preprocessText(element.text))
        .filter((text) => text.length >= 10); // Filter out very short segments

      if (preprocessedTexts.length === 0) {
        this.logger.warn('No valid text segments found after preprocessing');
        return;
      }

      this.logger.debug('Creating embeddings with Voyage');
      const response = await fetch(
        'https://api.voyageai.com/v1/embeddings',
        this.getHttpOptions(preprocessedTexts),
      );

      const data = (await response.json()) as EmbeddingResponse;
      for (const embedding of data.data) {
        await this.db.insert(schema.Embedding).values({
          fileId,
          content: unstructuredResponse.elements[embedding.index].text,
          embedding: embedding.embedding,
        });
      }

      this.logger.log(`Inserted ${data.data.length} embeddings`);
    } catch (error) {
      this.logger.error(`Error creating embeddings: ${error.message}`);
    }
  }

  private preprocessText(text: string): string {
    return (
      text
        // Remove standalone numbers (likely page numbers)
        .replace(/^\d+$|(?<=\n)\d+(?=\n)/gm, '')
        // Fix hyphenated words (like "An- bindung" -> "Anbindung")
        .replace(/(\w+)-\s+(\w+)/g, (_, p1, p2) => {
          // Only join if both parts are purely alphabetical
          if (/^[a-zA-Z]+$/.test(p1) && /^[a-zA-Z]+$/.test(p2)) {
            return p1 + p2;
          }
          // Otherwise keep the hyphen
          return `${p1}-${p2}`;
        })
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/[\r\n]+/g, ' ') // Replace newlines with space
        .trim() // Remove leading/trailing whitespace
        .replace(/[^\w\s.,!?-]/g, '') // Remove special characters except basic punctuation
        .replace(/\s+/g, ' ')
    ); // Clean up any double spaces that might have been created
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
    } catch (error) {
      this.logger.error(`Error finding similar embeddings: ${error.message}`);
      throw error;
    }
  }
}
