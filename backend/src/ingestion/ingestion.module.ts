import {
  Module,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';

import { IngestionQueueService } from './ingestion-queue.service';
import { IngestionStatusService } from './ingestion-status.service';
import { IngestionService } from './ingestion.service';
import { PdfProcessor, ProcessorFactory } from './processors';
import { UnstructuredService } from './unstructured.service';

@Module({
  imports: [],
  providers: [
    IngestionService,
    UnstructuredService,
    IngestionQueueService,
    IngestionStatusService,
    PdfProcessor,
    ProcessorFactory,
  ],
})
export class IngestionModule
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  constructor(private readonly ingestionService: IngestionService) {}

  onApplicationBootstrap() {
    this.ingestionService.startIngestion();
  }

  async onApplicationShutdown() {
    await this.ingestionService.onApplicationShutdown();
  }
}
