import { LlmModule } from '@llm/llm.module';
import {
  Module,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';

import { EmbeddingService } from './embedding.service';
import { IngestionQueueService } from './ingestion-queue.service';
import { IngestionService } from './ingestion.service';
import { UnstructuredService } from './unstructured.service';

@Module({
  imports: [LlmModule],
  providers: [
    IngestionService,
    UnstructuredService,
    EmbeddingService,
    IngestionQueueService,
  ],
})
export class IngestionModule
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  constructor(private readonly ingestionService: IngestionService) {}

  async onApplicationBootstrap() {
    await this.ingestionService.startIngestion();
  }

  async onApplicationShutdown() {
    await this.ingestionService.onApplicationShutdown();
  }
}
