import {
  Module,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';

import { IngestionQueueService } from './ingestion-queue.service';
import { IngestionStatusService } from './ingestion-status.service';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { PdfProcessor, ProcessorFactory } from './processors';
import { UnstructuredService } from './unstructured.service';

@Module({
  controllers: [IngestionController],
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

  onApplicationShutdown() {
    this.ingestionService.onApplicationShutdown();
  }
}
