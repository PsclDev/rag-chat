import { DrizzleDb, InjectDrizzle } from '@database';
import { File } from '@file/schema/file.schema';
import { AnthropicService } from '@llm/providers/anthropic.service';
import { Injectable, Logger } from '@nestjs/common';
import { asc, desc } from 'drizzle-orm';

import { EmbeddingService } from './embedding.service';
import { UnstructuredService } from './unstructured.service';
@Injectable()
export class IngestionService {
  private readonly logger = new Logger('IngestionService');

  constructor(
    @InjectDrizzle()
    private readonly db: DrizzleDb,
    private readonly unstructuredService: UnstructuredService,
    private readonly embeddingService: EmbeddingService,
    private readonly llmService: AnthropicService,
  ) {}

  async startIngestion(): Promise<void> {
    this.logger.log(
      'Starting ingestion... waiting 5 seconds before getting files',
    );
    await new Promise((resolve) => setTimeout(resolve, 5000));

    this.getFiles();
  }

  async getFiles(): Promise<void> {
    const files = await this.db
      .select()
      .from(File)
      .orderBy(desc(File.createdAt))
      .limit(1);

    // const file = files[0];
    // const unstructuredResposne = await this.unstructuredService.partition(file);

    // console.log(JSON.stringify(unstructuredResposne.elements, null, 2));

    // await this.embeddingService.createEmbeddings(file.id, unstructuredResposne);

    const query =
      'Eine trennscharfe Unterscheidung zwischen „Reichsbürgern“ und „Selbstverwaltern“';
    const similarEmbeds = await this.embeddingService.findSimilarEmbeddings(
      query,
    );

    this.logger.log(
      `Found ${similarEmbeds.length} similar embeddings for query '${query}'`,
    );

    console.log(JSON.stringify(similarEmbeds, null, 2));

    const context = similarEmbeds.map((embed) => embed.content).join('\n');
    await this.llmService.sendMessage(context, query);
  }
}
