import { Injectable } from '@nestjs/common';

import { ConfigService } from '@config';
import { DrizzleDb, InjectDrizzle } from '@database';
import { IngestionStatusService } from '@ingestion/ingestion-status.service';
import { UnstructuredService } from '@ingestion/unstructured.service';
import { DocumentIngestionVo } from '@ingestion/vo/ingestion.vo';
import { EmbeddingService } from 'shared/embedding/embedding.service';

import { BaseProcessor } from './base.processor';
import { PdfProcessor } from './pdf.processor';

@Injectable()
export class ProcessorFactory {
  private readonly processors: {
    processor: typeof PdfProcessor;
    supportedMimetypes: string[];
  }[] = [
    {
      processor: PdfProcessor,
      supportedMimetypes: ['application/pdf'],
    },
  ] as const;

  constructor(
    private readonly configService: ConfigService,
    @InjectDrizzle() private readonly db: DrizzleDb,
    private readonly ingestionStatusService: IngestionStatusService,
    private readonly unstructuredService: UnstructuredService,
    private readonly embeddingService: EmbeddingService,
  ) { }

  canFileBeProcessed(mimetype: string): boolean {
    return this.processors.some((processor) =>
      processor.supportedMimetypes.includes(mimetype),
    );
  }

  create(
    ingestion: DocumentIngestionVo,
    abortSignal: AbortSignal,
  ): BaseProcessor | null {
    const matchingProcessor = this.processors.find((p) =>
      p.supportedMimetypes.includes(ingestion.document.file.mimetype),
    );

    if (!matchingProcessor) {
      return null;
    }

    return new matchingProcessor.processor(
      this.configService,
      this.db,
      this.ingestionStatusService,
      this.unstructuredService,
      this.embeddingService,
      ingestion,
      abortSignal,
    );
  }
}
