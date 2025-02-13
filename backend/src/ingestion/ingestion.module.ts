import { LlmModule } from '@llm/llm.module';
import { Module, OnApplicationBootstrap } from '@nestjs/common';

import { EmbeddingService } from './embedding.service';
import { IngestionService } from './ingestion.service';
import { UnstructuredService } from './unstructured.service';

@Module({
  imports: [LlmModule],
  providers: [IngestionService, UnstructuredService, EmbeddingService],
})
export class IngestionModule implements OnApplicationBootstrap {
  constructor(private readonly ingestionService: IngestionService) {}

  async onApplicationBootstrap() {
    await this.ingestionService.startIngestion();
  }
}
