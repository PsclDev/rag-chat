import { Logger } from '@nestjs/common';
import { Strategy } from 'unstructured-client/sdk/models/shared';

import { ConfigService } from '@config';
import { DrizzleDb, InjectDrizzle } from '@database';
import { IngestionStatusService } from '@ingestion/ingestion-status.service';
import { UnstructuredService } from '@ingestion/unstructured.service';
import { FileIngestionVo } from '@ingestion/vo/ingestion.vo';
import { EmbeddingService } from 'shared/embedding/embedding.service';

import { BaseProcessor } from './base.processor';

export class PdfProcessor extends BaseProcessor {
  protected readonly logger = new Logger('PdfProcessor');
  supportedMimetypes = ['application/pdf'];

  constructor(
    readonly configService: ConfigService,
    @InjectDrizzle() readonly db: DrizzleDb,
    readonly ingestionStatusService: IngestionStatusService,
    readonly unstructuredService: UnstructuredService,
    readonly embeddingService: EmbeddingService,
  ) {
    super(
      configService,
      db,
      ingestionStatusService,
      unstructuredService,
      embeddingService,
    );
  }

  async specificProcess(
    ingestion: FileIngestionVo,
    abortSignal: AbortSignal,
  ): Promise<void> {
    this.logger.debug(
      'Deleting all existing embeddings for file',
      ingestion.file.id,
    );
    await this.embeddingService.deleteAllEmbeddings(ingestion.file.id);

    const unstructuredRes = await this.unstructuredService.partition(
      ingestion.file,
      {
        chunkingStrategy: 'by_title',
        strategy: Strategy.HiRes,
        splitPdfPage: true,
        splitPdfConcurrencyLevel: 15,
      },
      abortSignal,
    );

    if (!unstructuredRes.length) {
      this.logger.warn('No elements found in unstructured response');
      return;
    }

    const processedContent = unstructuredRes.map((element) =>
      this.preprocessText(element.text),
    );

    await this.embeddingService.createEmbeddings(
      ingestion.file.id,
      processedContent,
      abortSignal,
    );
  }
}
