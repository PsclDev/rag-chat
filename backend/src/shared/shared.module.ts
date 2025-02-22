import { ConfigService } from '@config';
import { DrizzleDb } from '@database';
import { Global, Logger, Module } from '@nestjs/common';
import { PG_PROVIDER } from 'app.definition';

import { EmbeddingService } from './embedding/embedding.service';
import { SentenceTransformerAdapterService } from './embedding/sentence-transformer.adapter';
import { VoyageAdapterService } from './embedding/voyage.adapter';

@Global()
@Module({
  providers: [
    {
      provide: EmbeddingService,
      inject: [ConfigService, PG_PROVIDER],
      useFactory: (
        configService: ConfigService,
        db: DrizzleDb,
      ): EmbeddingService => {
        const adapter = configService.llm.embedding.adapter;
        const logger = new Logger('EmbeddingService');
        logger.log(`Using embedding adapter: ${adapter}`);

        switch (adapter) {
          case 'voyage':
            return new VoyageAdapterService(configService, db);
          case 'sentence-transformer':
            return new SentenceTransformerAdapterService();
          default:
            throw new Error(`Unknown embedding adapter: ${adapter}`);
        }
      },
    },
  ],
  exports: [EmbeddingService],
})
export class SharedModule {}
