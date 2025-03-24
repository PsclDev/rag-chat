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

  constructor(
    readonly configService: ConfigService,
    @InjectDrizzle() readonly db: DrizzleDb,
    readonly ingestionStatusService: IngestionStatusService,
    readonly unstructuredService: UnstructuredService,
    readonly embeddingService: EmbeddingService,
    ingestion: FileIngestionVo,
    abortSignal: AbortSignal,
  ) {
    super(
      configService,
      db,
      ingestionStatusService,
      unstructuredService,
      embeddingService,
      ingestion,
      abortSignal,
    );
  }

  async specificProcess(): Promise<void> {
    const unstructuredRes = await this.unstructuredService.partition(
      this.ingestionFile.file,
      {
        chunkingStrategy: 'by_title',
        strategy: Strategy.HiRes,
        splitPdfPage: true,
        splitPdfConcurrencyLevel: 15,
      },
      this.abortSignal,
    );

    if (!unstructuredRes.length) {
      this.logger.warn('No elements found in unstructured response');
      return;
    }

    const processedContent = unstructuredRes.map((element) =>
      this.preprocessText(element.text),
    );

    const extractedImages = await this.extractImages(
      unstructuredRes.map((element) => element.metadata.orig_elements),
    );

    await this.embeddingService.createTextEmbeddings(
      this.ingestionFile.file.id,
      processedContent,
      this.abortSignal,
    );

    await this.embeddingService.createImageEmbeddings(
      this.ingestionFile.file.id,
      extractedImages,
      this.abortSignal,
    );
  }
}
