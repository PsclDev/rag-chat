import { Global, Logger, Module } from '@nestjs/common';

import { ConfigService } from '@config';
import { DrizzleDb } from '@database';
import { LlmModule } from '@llm/llm.module';
import { AnthropicService } from '@llm/models/anthropic.service';
import { PG_PROVIDER } from 'app.definition';

import { EmbeddingService } from './embedding/embedding.service';
import { VoyageAdapterService } from './embedding/voyage.adapter';
import { NotificationGateway } from './notification/notification.gateway';
import { NotificationService } from './notification/notification.service';

const provideAndExport = [NotificationService];

@Global()
@Module({
  imports: [LlmModule],
  providers: [
    NotificationGateway,
    {
      provide: EmbeddingService,
      inject: [ConfigService, PG_PROVIDER, AnthropicService],
      useFactory: (
        configService: ConfigService,
        db: DrizzleDb,
        llmService: AnthropicService,
      ): EmbeddingService => {
        const adapter = configService.llm.embedding.adapter;
        const logger = new Logger('EmbeddingService');
        logger.log(`Using embedding adapter: ${adapter}`);

        switch (adapter) {
          case 'voyage':
            return new VoyageAdapterService(configService, db, llmService);
          default:
            throw new Error(`Unknown embedding adapter: ${adapter}`);
        }
      },
    },
    ...provideAndExport,
  ],
  exports: [EmbeddingService, ...provideAndExport],
})
export class SharedModule {}
