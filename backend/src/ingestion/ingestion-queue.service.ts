import { ConfigService } from '@config';
import {
  DrizzleDb,
  FileQueue,
  InjectDrizzle,
  FileQueueEntity,
} from '@database';
import { Injectable, Logger } from '@nestjs/common';
import { inArray, and, eq, isNull } from 'drizzle-orm';

@Injectable()
export class IngestionQueueService {
  private readonly logger = new Logger('IngestionQueueService');
  private isFirstRun = true;

  constructor(
    private readonly configService: ConfigService,
    @InjectDrizzle() private readonly db: DrizzleDb,
  ) {}

  getFilesToIngest(): Promise<FileQueueEntity[]> {
    return this.db.transaction(async (trx) => {
      const whereCondition = this.isFirstRun
        ? and(
            eq(FileQueue.isCompleted, false),
            eq(FileQueue.isProcessing, true),
            eq(FileQueue.nodeId, this.configService.nodeId),
          )
        : and(eq(FileQueue.isCompleted, false), isNull(FileQueue.nodeId));

      const files = await trx
        .select()
        .from(FileQueue)
        .where(whereCondition)
        .orderBy(FileQueue.enqueuedAt)
        .limit(this.configService.ingestion.batchSize)
        .for('update', { skipLocked: true });

      if (this.isFirstRun) {
        this.isFirstRun = false;
        if (files.length > 0) {
          this.logger.warn(
            `Found ${files.length} stuck files from previous crash`,
          );
          return files;
        }
        // If no stuck files found, immediately try again with isFirstRun = false
        return this.getFilesToIngest();
      }

      if (files.length === 0) return [];

      await trx
        .update(FileQueue)
        .set({
          isProcessing: true,
          nodeId: this.configService.nodeId,
        })
        .where(
          inArray(
            FileQueue.id,
            files.map((f) => f.id),
          ),
        );

      return files;
    });
  }
}
