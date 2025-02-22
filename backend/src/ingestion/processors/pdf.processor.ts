import { ConfigService } from '@config';
import { DrizzleDb, FileEntity, FileQueue, InjectDrizzle } from '@database';
import { UnstructuredService } from '@ingestion/unstructured.service';
import { Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { EmbeddingService } from 'shared/embedding/embedding.service';
import {
  ChunkingStrategy,
  Strategy,
} from 'unstructured-client/sdk/models/shared';

import { BaseProcessor } from './base.processor';

export class PdfProcessor extends BaseProcessor {
  protected readonly logger = new Logger('PdfProcessor');
  supportedMimetypes = ['application/pdf'];

  constructor(
    readonly configService: ConfigService,
    @InjectDrizzle() readonly db: DrizzleDb,
    readonly unstructuredService: UnstructuredService,
    readonly embeddingService: EmbeddingService,
  ) {
    super(configService, db, unstructuredService, embeddingService);
  }

  async specificProcess(
    file: FileEntity,
    abortSignal: AbortSignal,
  ): Promise<void> {
    this.logger.debug('Deleting all existing embeddings for file', file.id);
    await this.embeddingService.deleteAllEmbeddings(file.id);

    const unstructuredRes = await this.unstructuredService.partition(
      file,
      {
        chunkingStrategy: ChunkingStrategy.ByTitle,
        strategy: Strategy.Fast,
        splitPdfPage: true,
        splitPdfConcurrencyLevel: 15,
      },
      abortSignal,
    );

    if (!unstructuredRes.elements) {
      this.logger.warn('No elements found in unstructured response');
      return;
    }

    const processedContent = unstructuredRes.elements.map((element) =>
      this.preprocessText(element.text),
    );

    await this.embeddingService.createEmbeddings(
      file.id,
      processedContent,
      abortSignal,
    );

    await this.db
      .update(FileQueue)
      .set({
        isCompleted: true,
        isProcessing: false,
        completedAt: new Date(),
      })
      .where(eq(FileQueue.id, file.id));
  }
}
