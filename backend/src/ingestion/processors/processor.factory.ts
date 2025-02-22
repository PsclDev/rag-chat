import { ConfigService } from '@config';
import { DrizzleDb, InjectDrizzle } from '@database';
import { UnstructuredService } from '@ingestion/unstructured.service';
import { Injectable } from '@nestjs/common';
import { EmbeddingService } from 'shared/embedding/embedding.service';

import { BaseProcessor } from './base.processor';
import { PdfProcessor } from './pdf.processor';

@Injectable()
export class ProcessorFactory {
  private readonly processors = [PdfProcessor] as const;
  private readonly instances: BaseProcessor[];

  constructor(
    private readonly configService: ConfigService,
    @InjectDrizzle() private readonly db: DrizzleDb,
    private readonly unstructuredService: UnstructuredService,
    private readonly embeddingService: EmbeddingService,
  ) {
    this.instances = this.processors.map(
      (Processor) =>
        new Processor(configService, db, unstructuredService, embeddingService),
    );
  }

  canFileBeProcessed(mimetype: string): boolean {
    return this.instances.some((processor) =>
      processor.supportedMimetypes.includes(mimetype),
    );
  }

  create(mimetype: string): BaseProcessor | null {
    const matchingProcessor = this.instances.find((p) =>
      p.supportedMimetypes.includes(mimetype),
    );

    if (!matchingProcessor) {
      return null;
    }

    const processor = this.processors.find(
      (P) => matchingProcessor instanceof P,
    );

    if (!processor) {
      throw new Error(`Processor ${matchingProcessor} not found`);
    }

    return new processor(
      this.configService,
      this.db,
      this.unstructuredService,
      this.embeddingService,
    );
  }
}
