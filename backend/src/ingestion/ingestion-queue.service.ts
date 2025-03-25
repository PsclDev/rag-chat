import { Injectable, Logger } from '@nestjs/common';
import { inArray, and, eq, isNull } from 'drizzle-orm';

import { ConfigService } from '@config';
import {
  DrizzleDb,
  DocumentQueue,
  InjectDrizzle,
  DocumentQueueEntity,
} from '@database';

@Injectable()
export class IngestionQueueService {
  private readonly logger = new Logger('IngestionQueueService');
  private isFirstRun = true;

  constructor(
    private readonly configService: ConfigService,
    @InjectDrizzle() private readonly db: DrizzleDb,
  ) { }

  getDocumentsToIngest(): Promise<DocumentQueueEntity[]> {
    return this.db.transaction(async (trx) => {
      const whereCondition = this.isFirstRun
        ? and(
          eq(DocumentQueue.isCompleted, false),
          eq(DocumentQueue.isProcessing, true),
          eq(DocumentQueue.nodeId, this.configService.nodeId),
        )
        : and(eq(DocumentQueue.isCompleted, false), isNull(DocumentQueue.nodeId));

      const files = await trx
        .select()
        .from(DocumentQueue)
        .where(whereCondition)
        .orderBy(DocumentQueue.enqueuedAt)
        .limit(this.configService.ingestion.batchSize)
        .for('update', { skipLocked: true });

      if (this.isFirstRun) {
        this.isFirstRun = false;
        if (files.length > 0) {
          this.logger.warn(
            `Found ${files.length} stuck documents from previous crash`,
          );
          return files;
        }
        // If no stuck files found, immediately try again with isFirstRun = false
        return this.getDocumentsToIngest();
      }

      if (files.length === 0) return [];

      await trx
        .update(DocumentQueue)
        .set({
          isProcessing: true,
          nodeId: this.configService.nodeId,
        })
        .where(
          inArray(
            DocumentQueue.id,
            files.map((f) => f.id),
          ),
        );

      return files;
    });
  }
}
